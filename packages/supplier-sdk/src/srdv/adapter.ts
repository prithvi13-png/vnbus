import type { TripSearchRequest, TripSearchResponse } from "@vnbus/types";

import { SrdvClient, type SrdvClientOptions } from "./client";
import { toBusSearchResult } from "./mappers";
import type { SrdvSearchResponse } from "./types";

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
export class SrdvBusAdapter {
  readonly code = "SRDV" as const;
  readonly name = "SRDV Technologies";

  private readonly client: SrdvClient;

  constructor(
    options: SrdvClientOptions,
    /** City name (lower-case) -> SRDV numeric city code. */
    private readonly cityCodes: ReadonlyMap<string, string>,
  ) {
    this.client = new SrdvClient(options);
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
      const payload = await this.client.post<SrdvSearchResponse>("Search", "v9/rest/Search", {
        FromCityCode: fromCode,
        ToCityCode: toCode,
        DepartDate: request.journeyDate,
      });

      const trips = (payload.Result ?? []).map((result) =>
        toBusSearchResult(result, {
          sourceCity: request.sourceCity,
          destinationCity: request.destinationCity,
          journeyDate: request.journeyDate,
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
   * Not implemented: the request/response contracts for these were not
   * supplied. Throwing keeps the booking flow from advancing on data this
   * adapter cannot actually obtain.
   */
  private notImplemented(operation: string): never {
    throw new Error(
      `SRDV ${operation} is not implemented yet — the v9 contract for it has not been supplied.`,
    );
  }

  getSeatLayout(): never {
    return this.notImplemented("GetSeatLayout");
  }

  blockSeats(): never {
    return this.notImplemented("Block");
  }

  holdSeats(): never {
    return this.notImplemented("Block");
  }

  confirmBooking(): never {
    return this.notImplemented("Book");
  }

  getBookingStatus(): never {
    return this.notImplemented("GetBookingDetails");
  }

  cancelBooking(): never {
    return this.notImplemented("Cancel");
  }

  getTicket(): never {
    return this.notImplemented("GetBookingDetails");
  }
}
