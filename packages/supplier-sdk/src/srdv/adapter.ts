import type {
  BoardingPoint,
  Cancellation,
  DroppingPoint,
  SeatLayoutDetails,
  SupplierHealth,
  SupplierOperation,
  TripSearchRequest,
  TripSearchResponse,
} from "@vnbus/types";

// Imported for use inside method bodies only. src/index.ts re-exports this
// folder, so this is a cycle: these bindings are still in their temporal dead
// zone while this module is evaluated. Referencing them at call time is fine;
// extending them at class-definition time would not be.
import {
  NotImplementedSupplierError,
  SupplierBookingFailedError,
  SupplierValidationError,
  type SeatBlockRequest,
  type SeatBlockResponse,
  type SeatLayoutRequest,
  type SupplierAdapter,
  type SupplierBlockPassenger,
  type SupplierCancelBookingRequest,
  type SupplierConfirmBookingRequest,
  type SupplierConfirmBookingResponse,
  type SupplierTripDetailsRequest,
} from "../index.js";
import { SrdvApiError, SrdvClient, type SrdvClientOptions } from "./client.js";
import {
  decodeSrdvTripId,
  isSrdvBookingSuccessful,
  toBusSearchResult,
  toCancellation,
  toConfirmedBooking,
  toPointDetails,
  toSeatBlock,
  toSeatLayout,
  toSrdvGender,
  type SrdvPointDetails,
} from "./mappers.js";
import type {
  SrdvBalanceLogEntry,
  SrdvBalanceLogResponse,
  SrdvBalanceResponse,
  SrdvBlockResponse,
  SrdvBookResponse,
  SrdvCancelResponse,
  SrdvBoardingPointDetailsResponse,
  SrdvSearchResponse,
  SrdvSeatLayoutResponse,
} from "./types.js";

/**
 * SRDV Technologies Bus API v9.
 *
 * Search is implemented against the documented contract. The remaining
 * operations — seat layout, block, book, booking details and cancel — are not,
 * because their request/response shapes were not supplied. They throw rather
 * than return plausible-looking data, so a half-wired supplier cannot quietly
 * sell a seat that was never reserved upstream.
 *
 * SRDV addresses cities by numeric code ("FromCityCode": "19402"), not by name.
 * Until the city list or lookup endpoint is available, `cityCodes` must be
 * supplied by the caller; an unmapped city is reported as an error rather than
 * guessed.
 */
export class SrdvBusAdapter implements SupplierAdapter {
  readonly code = "SRDV" as const;
  readonly name = "SRDV Technologies";

  private readonly client: SrdvClient;

  private readonly restPathPrefix: string;

  constructor(
    options: SrdvClientOptions,
    /** City name (lower-case) -> SRDV numeric city code. */
    private readonly cityCodes: ReadonlyMap<string, string>,
    /**
     * Path segment between the configured base URL and the operation name.
     *
     * The documentation is ambiguous about where the version sits: the Postman
     * collection calls "{{BusBaseUrl}}v9/rest/Search" while the integration
     * notes give the base as ".../bus/v9/". Both spellings reach the same
     * endpoint, so this is configurable instead of guessed —
     *   base ".../bus"    + prefix "v9/rest" -> /bus/v9/rest/Search
     *   base ".../bus/v9" + prefix "rest"    -> /bus/v9/rest/Search
     * A probe cannot settle it: the host token-checks before it routes, so
     * every path under /bus/ answers identically until a valid token is set.
     */
    restPathPrefix = "v9/rest",
  ) {
    this.client = new SrdvClient(options);
    this.restPathPrefix = restPathPrefix.replace(/^\/+|\/+$/gu, "");
  }

  private get searchPath(): string {
    return this.operationPath("Search");
  }

  private operationPath(operation: string): string {
    return this.restPathPrefix ? `${this.restPathPrefix}/${operation}` : operation;
  }

  private codeFor(city: string): string | null {
    return this.cityCodes.get(city.trim().toLowerCase()) ?? null;
  }

  async searchTrips(request: TripSearchRequest): Promise<TripSearchResponse> {
    const startedAt = Date.now();
    const fromCode = this.codeFor(request.sourceCity);
    const toCode = this.codeFor(request.destinationCity);

    if (!fromCode || !toCode) {
      const missing = !fromCode ? request.sourceCity : request.destinationCity;

      return this.failure(
        startedAt,
        "VALIDATION_ERROR",
        `No SRDV city code is mapped for "${missing}"`,
      );
    }

    try {
      const payload = await this.client.post<SrdvSearchResponse>("Search", this.searchPath, {
        FromCityCode: fromCode,
        ToCityCode: toCode,
        DepartDate: request.journeyDate,
      });

      const trips = (payload.Result ?? []).map((result) =>
        toBusSearchResult(result, {
          sourceCity: request.sourceCity,
          destinationCity: request.destinationCity,
          journeyDate: request.journeyDate,
          traceId: String(payload.TraceId ?? ""),
        }),
      );

      return {
        success: true,
        status: trips.length > 0 ? "AVAILABLE" : "NO_SUPPLIER_AVAILABLE",
        trips,
        supplierResults: [
          {
            supplierCode: this.code,
            status: "SUCCESS",
            resultCount: trips.length,
            durationMs: Date.now() - startedAt,
          },
        ],
        errors: [],
        duplicateGroups: [],
        requestId: String(payload.TraceId ?? ""),
        correlationId: String(payload.TraceId ?? ""),
      };
    } catch (caught) {
      return this.failure(
        startedAt,
        "SUPPLIER_ERROR",
        caught instanceof Error ? caught.message : "SRDV search failed",
      );
    }
  }

  private failure(startedAt: number, code: string, message: string): TripSearchResponse {
    return {
      success: false,
      status: "SUPPLIER_UNAVAILABLE",
      trips: [],
      supplierResults: [
        {
          supplierCode: this.code,
          status: "FAILED",
          resultCount: 0,
          durationMs: Date.now() - startedAt,
        },
      ],
      errors: [{ supplierCode: this.code, code, message, retryable: true }],
      duplicateGroups: [],
      requestId: "",
      correlationId: "",
    } as unknown as TripSearchResponse;
  }

  /**
   * Liveness probe, via Balance — a documented account-level endpoint that
   * needs no trip context and sells nothing, which makes it the honest choice
   * for a health check:
   *
   *  - network failure or timeout  -> UNAVAILABLE (host unreachable)
   *  - rejected credentials        -> DEGRADED (reachable, cannot transact)
   *  - any other answer            -> AVAILABLE (endpoint is live; a business
   *                                  error is expected, since a probe omits
   *                                  the search fields)
   *
   * Credentials are never echoed into the returned message.
   */
  async healthCheck(): Promise<SupplierHealth> {
    const checkedAt = new Date().toISOString();
    const startedAt = Date.now();

    const result = async (): Promise<Pick<SupplierHealth, "status" | "message">> => {
      try {
        await this.client.post<SrdvBalanceResponse>(
          "HealthCheck",
          this.operationPath("Balance"),
          {},
        );

        return { status: "AVAILABLE", message: "SRDV responded." };
      } catch (caught) {
        if (!(caught instanceof SrdvApiError)) {
          return { status: "UNAVAILABLE", message: "SRDV health probe failed." };
        }
        // -1 is the client's sentinel for transport failures (network, timeout,
        // non-2xx); anything else came back through SRDV's own error envelope,
        // which proves the endpoint answered.
        if (caught.errorCode === -1) {
          return { status: "UNAVAILABLE", message: "SRDV is unreachable." };
        }
        if (isCredentialRejection(caught.errorCode)) {
          return { status: "DEGRADED", message: "SRDV rejected the configured credentials." };
        }

        return { status: "AVAILABLE", message: "SRDV responded." };
      }
    };

    const { status, message } = await result();
    const responseTimeMs = Date.now() - startedAt;
    const healthy = status === "AVAILABLE";

    return {
      supplierCode: this.code,
      status,
      responseTimeMs,
      successRate: healthy ? 1 : 0,
      failureRate: healthy ? 0 : 1,
      lastSuccessfulRequestAt: healthy ? new Date().toISOString() : null,
      lastFailureAt: healthy ? null : new Date().toISOString(),
      checkedAt,
      message,
    };
  }

  /**
   * Every operation whose v9 contract has not been supplied. These reject with
   * NotImplementedSupplierError, which SupplierManagerService maps to a
   * non-retryable supplier error — so it is reported once rather than burning
   * the retry budget, and never degrades into mock data or a fabricated
   * booking. They start working by being implemented, not by being configured.
   */
  private notImplemented(operation: SupplierOperation): Promise<never> {
    return Promise.reject(new NotImplementedSupplierError(this.code, operation));
  }

  getTripDetails(): Promise<never> {
    return this.notImplemented("GET_TRIP_DETAILS");
  }

  /**
   * GetSeatLayOut. Needs TraceId + SrdvIndex + ResultIndex, all three recovered
   * from the tripId that Search encoded — a tripId from any other source cannot
   * address an SRDV seat map and is rejected rather than sent as a partial
   * request.
   */
  async getSeatLayout(request: SeatLayoutRequest): Promise<SeatLayoutDetails> {
    const ref = decodeSrdvTripId(request.tripId);

    if (!ref) {
      throw new SupplierValidationError(
        this.code,
        "GET_SEAT_LAYOUT",
        "Trip id does not carry the SRDV TraceId/SrdvIndex/ResultIndex. Re-run the search before opening the seat map.",
      );
    }

    const payload = await this.client.post<SrdvSeatLayoutResponse>(
      "GetSeatLayOut",
      this.operationPath("GetSeatLayOut"),
      {
        TraceId: ref.traceId,
        SrdvIndex: ref.srdvIndex,
        ResultIndex: ref.resultIndex,
      },
    );

    return toSeatLayout(payload, {
      supplierCode: this.code,
      tripId: request.tripId,
      journeyDate: request.journeyDate,
      maxSelectableSeats: ref.maxSeatsPerTicket,
    });
  }

  holdSeats(): Promise<never> {
    return this.notImplemented("HOLD_SEATS");
  }

  releaseSeats(): Promise<never> {
    return this.notImplemented("RELEASE_SEATS");
  }

  /**
   * Block. Reserves the seats upstream and returns the BlockKey that Book
   * needs.
   *
   * SRDV requires full identity per passenger, so a request missing any of it
   * is refused here rather than sent half-formed: a rejected Block is a clear
   * error, while a Block accepted with bad passenger data becomes a ticket that
   * cannot be boarded.
   */
  async blockSeats(request: SeatBlockRequest): Promise<SeatBlockResponse> {
    const ref = decodeSrdvTripId(request.tripId);

    if (!ref) {
      throw new SupplierValidationError(
        this.code,
        "HOLD_SEATS",
        "Trip id does not carry the SRDV TraceId/SrdvIndex/ResultIndex. Re-run the search before blocking seats.",
      );
    }

    if (!request.boardingPointId || !request.droppingPointId) {
      throw new SupplierValidationError(
        this.code,
        "HOLD_SEATS",
        "SRDV requires a boarding point and a dropping point to block seats.",
      );
    }

    if (request.passengers.length === 0) {
      throw new SupplierValidationError(this.code, "HOLD_SEATS", "No passengers to block.");
    }

    const missing = request.passengers.flatMap((passenger, index) =>
      describeMissingPassengerFields(passenger).map((field) => `passenger ${index + 1}: ${field}`),
    );

    if (missing.length > 0) {
      throw new SupplierValidationError(
        this.code,
        "HOLD_SEATS",
        `SRDV needs more passenger detail before it will block seats — ${missing.join("; ")}.`,
      );
    }

    // Exactly one lead passenger; default to the first when none is flagged.
    const leadIndex = Math.max(
      0,
      request.passengers.findIndex((passenger) => passenger.isLeadPassenger),
    );

    const payload = await this.client.post<SrdvBlockResponse>(
      "Block",
      this.operationPath("Block"),
      {
        TraceId: ref.traceId,
        SrdvIndex: ref.srdvIndex,
        ResultIndex: ref.resultIndex,
        BoardingPointId: request.boardingPointId,
        DroppingPointId: request.droppingPointId,
        // SRDV documents RefId as a number; it is the caller's own reference.
        RefId: 1,
        Passengers: request.passengers.map((passenger, index) => ({
          Title: passenger.title ?? "",
          FirstName: passenger.firstName ?? "",
          LastName: passenger.lastName ?? "",
          Gender: toSrdvGender(passenger.gender),
          Age: String(passenger.age ?? ""),
          Email: passenger.email ?? request.contactEmail,
          PhoneNo: passenger.phone ?? request.contactPhone,
          LeadPassenger: index === leadIndex ? "true" : "false",
          ...(passenger.idNumber ? { IdNumber: passenger.idNumber } : {}),
          ...(passenger.idType ? { IdType: passenger.idType } : {}),
          ...(passenger.address ? { Address: passenger.address } : {}),
          SeatName: passenger.seatNumber,
        })),
      },
    );

    if (!payload.BlockKey) {
      throw new SupplierBookingFailedError(
        this.code,
        "SRDV accepted the block request but returned no BlockKey, so the seats are not held.",
      );
    }

    return toSeatBlock(payload);
  }

  /**
   * Book. Completes the reservation Block created and returns the ticket.
   *
   * SRDV keys this off TraceId/SrdvIndex/ResultIndex, not the BlockKey, so the
   * tripId must come through; the documented request carries no BlockKey field
   * and none is invented here.
   *
   * This is the call that sells the seat, so two things are deliberate: a
   * missing trip reference refuses before any request goes out, and a reply is
   * only a booking when `Result.BusBookingStatus` says "Success" — `ErrorCode:
   * 0` on its own does not mean a ticket exists.
   */
  async confirmBooking(
    request: SupplierConfirmBookingRequest,
  ): Promise<SupplierConfirmBookingResponse> {
    const ref = request.tripId ? decodeSrdvTripId(request.tripId) : null;

    if (!ref) {
      throw new SupplierValidationError(
        this.code,
        "CONFIRM_BOOKING",
        "SRDV cannot book without the trip's TraceId/SrdvIndex/ResultIndex. Pass the tripId from the search alongside the block.",
      );
    }

    const payload = await this.client.post<SrdvBookResponse>("Book", this.operationPath("Book"), {
      TraceId: ref.traceId,
      SrdvIndex: ref.srdvIndex,
      ResultIndex: ref.resultIndex,
    });

    if (!isSrdvBookingSuccessful(payload)) {
      // Throwing rather than returning a FAILED status: a caller that forgets
      // to read the status field must not be able to treat this as a sale.
      throw new SupplierBookingFailedError(
        this.code,
        `SRDV did not complete the booking (status: ${
          payload.Result?.BusBookingStatus ?? "unknown"
        }).`,
      );
    }

    return toConfirmedBooking(payload);
  }

  getBookingStatus(): Promise<never> {
    return this.notImplemented("GET_BOOKING_STATUS");
  }

  /**
   * Cancel. Keyed by the search TraceId plus a seat name — not by booking id —
   * and it cancels a single seat per call, which is what SRDV's
   * PartialCancellationAllowed refers to.
   *
   * SRDV replies "In Process": accepted, not settled. That is surfaced as
   * REQUESTED with a PENDING refund, never CONFIRMED.
   */
  async cancelBooking(request: SupplierCancelBookingRequest): Promise<Cancellation> {
    const ref = request.tripId ? decodeSrdvTripId(request.tripId) : null;

    if (!ref) {
      throw new SupplierValidationError(
        this.code,
        "CANCEL_BOOKING",
        "SRDV cancels by the trip's TraceId. Pass the tripId from the search alongside the booking.",
      );
    }

    if (!request.seatName?.trim()) {
      throw new SupplierValidationError(
        this.code,
        "CANCEL_BOOKING",
        "SRDV cancels one seat at a time and needs the seat name.",
      );
    }

    const payload = await this.client.post<SrdvCancelResponse>(
      "Cancel",
      this.operationPath("Cancel"),
      {
        TraceId: ref.traceId,
        SeatName: request.seatName.trim(),
        Remark: request.reason,
      },
    );

    return toCancellation(payload, {
      bookingId: request.bookingId ?? request.supplierBookingId,
      supplierBookingId: request.supplierBookingId,
    });
  }

  /** Balance. Account credit; also the cheapest documented liveness probe. */
  async getBalance(): Promise<{ balance: string; creditLimit: string }> {
    const payload = await this.client.post<SrdvBalanceResponse>(
      "Balance",
      this.operationPath("Balance"),
      {},
    );

    return { balance: payload.Balance ?? "", creditLimit: payload.CreditLimit ?? "" };
  }

  /** BalanceLog. Ledger entries behind the current balance. */
  async getBalanceLog(): Promise<SrdvBalanceLogEntry[]> {
    const payload = await this.client.post<SrdvBalanceLogResponse>(
      "BalanceLog",
      this.operationPath("BalanceLog"),
      {},
    );

    return payload.Result ?? [];
  }

  rescheduleBooking(): Promise<never> {
    return this.notImplemented("RESCHEDULE_BOOKING");
  }

  getTicket(): Promise<never> {
    return this.notImplemented("GET_TICKET");
  }

  trackBus(): Promise<never> {
    return this.notImplemented("TRACK_BUS");
  }

  getCancellationPolicy(): Promise<never> {
    return this.notImplemented("GET_CANCELLATION_POLICY");
  }

  /**
   * GetBoardingPointDetails. One endpoint returns both lists, so each accessor
   * takes its own half. Callers needing both should prefer one call via
   * getPointDetails rather than two round trips.
   */
  async getBoardingPoints(request: SupplierTripDetailsRequest): Promise<BoardingPoint[]> {
    return (await this.getPointDetails(request, "GET_BOARDING_POINTS")).boardingPoints;
  }

  async getDroppingPoints(request: SupplierTripDetailsRequest): Promise<DroppingPoint[]> {
    return (await this.getPointDetails(request, "GET_DROPPING_POINTS")).droppingPoints;
  }

  /** Both point lists in a single GetBoardingPointDetails call. */
  async getPointDetails(
    request: SupplierTripDetailsRequest,
    operation: SupplierOperation = "GET_BOARDING_POINTS",
  ): Promise<SrdvPointDetails> {
    const ref = decodeSrdvTripId(request.tripId);

    if (!ref) {
      throw new SupplierValidationError(
        this.code,
        operation,
        "Trip id does not carry the SRDV TraceId/SrdvIndex/ResultIndex. Re-run the search before fetching boarding points.",
      );
    }

    const payload = await this.client.post<SrdvBoardingPointDetailsResponse>(
      "GetBoardingPointDetails",
      this.operationPath("GetBoardingPointDetails"),
      {
        TraceId: ref.traceId,
        SrdvIndex: ref.srdvIndex,
        ResultIndex: ref.resultIndex,
      },
    );

    return toPointDetails(payload, request.journeyDate);
  }

  downloadTicket(): Promise<never> {
    return this.notImplemented("GET_TICKET");
  }
}

/**
 * SRDV signals a bad token with ErrorCode 2008 ("Invalid API Token"), observed
 * against the test host. 2009 is reserved here for the adjacent IP-whitelist
 * rejection; both mean "reachable but not permitted", which is DEGRADED rather
 * than down.
 */
function isCredentialRejection(errorCode: number): boolean {
  return errorCode === 2008 || errorCode === 2009;
}

/** The identity fields SRDV's Block will not accept a passenger without. */
function describeMissingPassengerFields(passenger: SupplierBlockPassenger): string[] {
  const missing: string[] = [];

  if (!passenger.seatNumber) {
    missing.push("seat");
  }
  if (!passenger.firstName?.trim()) {
    missing.push("first name");
  }
  if (!passenger.lastName?.trim()) {
    missing.push("last name");
  }
  if (!passenger.title?.trim()) {
    missing.push("title");
  }
  if (!passenger.gender) {
    missing.push("gender");
  }
  if (passenger.age === undefined || passenger.age <= 0) {
    missing.push("age");
  }

  return missing;
}
