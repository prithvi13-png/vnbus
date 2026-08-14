import type {
  BoardingPoint,
  BookingRecord,
  BookingStatus,
  BusSearchResult,
  Cancellation,
  CancellationPolicy,
  DroppingPoint,
  Money,
  Reschedule,
  SeatHoldRequest,
  SeatHoldResponse,
  SeatLayoutDetails,
  SeatMapSeat,
  SeatReleaseRequest,
  SeatReleaseResponse,
  SupplierCode,
  SupplierError,
  SupplierHealth,
  SupplierOperation,
  TicketStatus,
  Tracking,
  TripSearchRequest,
  TripSearchResponse,
} from "@vnbus/types";
import {
  createMockSeatHold,
  getMockSeatLayout,
  getMockSupplierTrips,
  getMockTripById,
  releaseMockSeatHold,
  todayIsoDate,
} from "@vnbus/shared";

export const SUPPLIER_CODES = ["MOCK", "BCI", "REDBUS", "ABHIBUS", "TBO", "CUSTOM"] as const;

export interface SupplierOperationContext {
  requestId?: string;
  correlationId?: string;
  traceId?: string;
  timeoutMs?: number;
  idempotencyKey?: string;
}

export interface SeatLayoutRequest {
  supplierCode: SupplierCode;
  tripId: string;
  journeyDate: string;
}

export type SeatLayout = SeatLayoutDetails;

export type SeatLayoutSeat = SeatMapSeat;

export interface SupplierTripDetailsRequest {
  supplierCode?: SupplierCode;
  tripId: string;
  journeyDate: string;
  sourceCity?: string;
  destinationCity?: string;
}

export interface SeatBlockRequest {
  tripId: string;
  supplierCode: SupplierCode;
  passengers: Array<{ seatNumber: string }>;
  contactEmail: string;
  contactPhone: string;
}

export interface SeatBlockResponse {
  blockId: string;
  expiresAt: string;
  fare: Money;
}

export interface SupplierConfirmBookingRequest {
  supplierCode?: SupplierCode;
  blockId: string;
  booking?: BookingRecord;
  paymentReference: string;
}

export interface SupplierConfirmBookingResponse {
  supplierBookingId: string;
  pnr: string;
  ticketNumber: string;
  status: BookingStatus;
}

export interface SupplierBookingStatusRequest {
  supplierCode?: SupplierCode;
  supplierBookingId: string;
}

export interface SupplierBookingStatusResponse {
  supplierBookingId: string;
  status: BookingStatus;
  pnr: string | null;
  ticketNumber: string | null;
}

export interface SupplierCancelBookingRequest {
  supplierCode?: SupplierCode;
  bookingId?: string;
  supplierBookingId: string;
  reason: string;
}

export interface SupplierRescheduleBookingRequest {
  supplierCode?: SupplierCode;
  bookingId?: string;
  supplierBookingId: string;
  targetTripId: string;
  journeyDate: string;
}

export interface SupplierTicketRequest {
  supplierCode?: SupplierCode;
  supplierBookingId: string;
  ticketNumber?: string;
}

export interface SupplierTicketResponse {
  supplierBookingId: string;
  pnr: string;
  ticketNumber: string;
  status: TicketStatus;
  issuedAt: string;
}

export interface TrackBusRequest {
  supplierCode: SupplierCode;
  tripId: string;
  journeyDate: string;
}

export interface TicketDownloadRequest {
  supplierBookingId: string;
  ticketNumber: string;
}

export interface TicketDownloadResponse {
  fileName: string;
  mimeType: "application/pdf";
  bytes: Uint8Array;
}

export interface SupplierAdapter {
  readonly code: SupplierCode;
  readonly name: string;
  searchTrips(
    request: TripSearchRequest,
    context?: SupplierOperationContext,
  ): Promise<TripSearchResponse>;
  getTripDetails(
    request: SupplierTripDetailsRequest,
    context?: SupplierOperationContext,
  ): Promise<BusSearchResult>;
  getSeatLayout(
    request: SeatLayoutRequest,
    context?: SupplierOperationContext,
  ): Promise<SeatLayout>;
  holdSeats(
    request: SeatHoldRequest,
    context?: SupplierOperationContext,
  ): Promise<SeatHoldResponse>;
  releaseSeats(
    request: SeatReleaseRequest,
    context?: SupplierOperationContext,
  ): Promise<SeatReleaseResponse>;
  blockSeats(
    request: SeatBlockRequest,
    context?: SupplierOperationContext,
  ): Promise<SeatBlockResponse>;
  confirmBooking(
    request: SupplierConfirmBookingRequest,
    context?: SupplierOperationContext,
  ): Promise<SupplierConfirmBookingResponse>;
  getBookingStatus(
    request: SupplierBookingStatusRequest,
    context?: SupplierOperationContext,
  ): Promise<SupplierBookingStatusResponse>;
  cancelBooking(
    request: SupplierCancelBookingRequest,
    context?: SupplierOperationContext,
  ): Promise<Cancellation>;
  rescheduleBooking(
    request: SupplierRescheduleBookingRequest,
    context?: SupplierOperationContext,
  ): Promise<Reschedule>;
  getTicket(
    request: SupplierTicketRequest,
    context?: SupplierOperationContext,
  ): Promise<SupplierTicketResponse>;
  trackBus(request: TrackBusRequest, context?: SupplierOperationContext): Promise<Tracking>;
  getCancellationPolicy(
    request: SupplierTripDetailsRequest,
    context?: SupplierOperationContext,
  ): Promise<CancellationPolicy>;
  getBoardingPoints(
    request: SupplierTripDetailsRequest,
    context?: SupplierOperationContext,
  ): Promise<BoardingPoint[]>;
  getDroppingPoints(
    request: SupplierTripDetailsRequest,
    context?: SupplierOperationContext,
  ): Promise<DroppingPoint[]>;
  healthCheck(context?: SupplierOperationContext): Promise<SupplierHealth>;
  downloadTicket(
    request: TicketDownloadRequest,
    context?: SupplierOperationContext,
  ): Promise<TicketDownloadResponse>;
}

export class SupplierIntegrationError extends Error {
  constructor(
    readonly supplierCode: SupplierCode,
    readonly operation: SupplierOperation,
    readonly code: SupplierError["code"],
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = code;
  }

  toSupplierError(): SupplierError {
    return {
      supplierCode: this.supplierCode,
      operation: this.operation,
      code: this.code,
      message: this.message,
      retryable: this.retryable,
    };
  }
}

export class SupplierNotConfiguredError extends SupplierIntegrationError {
  constructor(supplierCode: SupplierCode, operation: SupplierOperation) {
    super(
      supplierCode,
      operation,
      "SUPPLIER_NOT_CONFIGURED",
      `${supplierCode} is not configured. Add credentials through secret references before enabling it.`,
      false,
    );
  }
}

export class SupplierUnavailableError extends SupplierIntegrationError {
  constructor(supplierCode: SupplierCode, operation: SupplierOperation, message?: string) {
    super(
      supplierCode,
      operation,
      "SUPPLIER_UNAVAILABLE",
      message ?? `${supplierCode} is unavailable for ${operation}.`,
      true,
    );
  }
}

export class SupplierTimeoutError extends SupplierIntegrationError {
  constructor(supplierCode: SupplierCode, operation: SupplierOperation) {
    super(
      supplierCode,
      operation,
      "SUPPLIER_TIMEOUT",
      `${supplierCode} timed out while executing ${operation}.`,
      true,
    );
  }
}

export class SupplierValidationError extends SupplierIntegrationError {
  constructor(supplierCode: SupplierCode, operation: SupplierOperation, message: string) {
    super(supplierCode, operation, "SUPPLIER_VALIDATION", message, false);
  }
}

export class SupplierBookingFailedError extends SupplierIntegrationError {
  constructor(supplierCode: SupplierCode, message: string) {
    super(supplierCode, "CONFIRM_BOOKING", "SUPPLIER_BOOKING_FAILED", message, false);
  }
}

export class SupplierSeatUnavailableError extends SupplierIntegrationError {
  constructor(supplierCode: SupplierCode, message: string) {
    super(supplierCode, "HOLD_SEATS", "SUPPLIER_SEAT_UNAVAILABLE", message, false);
  }
}

export class NotImplementedSupplierError extends SupplierIntegrationError {
  constructor(supplierCode: SupplierCode, operation: SupplierOperation) {
    super(
      supplierCode,
      operation,
      "NOT_IMPLEMENTED",
      `${operation} is not implemented for ${supplierCode}.`,
      false,
    );
  }
}

abstract class NotConfiguredSupplierAdapter implements SupplierAdapter {
  abstract readonly code: SupplierCode;
  abstract readonly name: string;

  searchTrips(_request: TripSearchRequest): Promise<TripSearchResponse> {
    return this.reject("SEARCH_TRIPS");
  }

  getTripDetails(_request: SupplierTripDetailsRequest): Promise<BusSearchResult> {
    return this.reject("GET_TRIP_DETAILS");
  }

  getSeatLayout(_request: SeatLayoutRequest): Promise<SeatLayout> {
    return this.reject("GET_SEAT_LAYOUT");
  }

  holdSeats(_request: SeatHoldRequest): Promise<SeatHoldResponse> {
    return this.reject("HOLD_SEATS");
  }

  releaseSeats(_request: SeatReleaseRequest): Promise<SeatReleaseResponse> {
    return this.reject("RELEASE_SEATS");
  }

  blockSeats(_request: SeatBlockRequest): Promise<SeatBlockResponse> {
    return this.reject("HOLD_SEATS");
  }

  confirmBooking(_request: SupplierConfirmBookingRequest): Promise<SupplierConfirmBookingResponse> {
    return this.reject("CONFIRM_BOOKING");
  }

  getBookingStatus(_request: SupplierBookingStatusRequest): Promise<SupplierBookingStatusResponse> {
    return this.reject("GET_BOOKING_STATUS");
  }

  cancelBooking(_request: SupplierCancelBookingRequest): Promise<Cancellation> {
    return this.reject("CANCEL_BOOKING");
  }

  rescheduleBooking(_request: SupplierRescheduleBookingRequest): Promise<Reschedule> {
    return this.reject("RESCHEDULE_BOOKING");
  }

  getTicket(_request: SupplierTicketRequest): Promise<SupplierTicketResponse> {
    return this.reject("GET_TICKET");
  }

  trackBus(_request: TrackBusRequest): Promise<Tracking> {
    return this.reject("TRACK_BUS");
  }

  getCancellationPolicy(_request: SupplierTripDetailsRequest): Promise<CancellationPolicy> {
    return this.reject("GET_CANCELLATION_POLICY");
  }

  getBoardingPoints(_request: SupplierTripDetailsRequest): Promise<BoardingPoint[]> {
    return this.reject("GET_BOARDING_POINTS");
  }

  getDroppingPoints(_request: SupplierTripDetailsRequest): Promise<DroppingPoint[]> {
    return this.reject("GET_DROPPING_POINTS");
  }

  healthCheck(): Promise<SupplierHealth> {
    return Promise.resolve({
      supplierCode: this.code,
      status: "UNAVAILABLE",
      responseTimeMs: 0,
      successRate: 0,
      failureRate: 1,
      lastSuccessfulRequestAt: null,
      lastFailureAt: new Date().toISOString(),
      checkedAt: new Date().toISOString(),
      message: "Not configured. No live connection attempted.",
    });
  }

  downloadTicket(_request: TicketDownloadRequest): Promise<TicketDownloadResponse> {
    return this.reject("GET_TICKET");
  }

  protected reject<T>(operation: SupplierOperation): Promise<T> {
    return Promise.reject(new SupplierNotConfiguredError(this.code, operation));
  }
}

export class BCIAdapter extends NotConfiguredSupplierAdapter {
  readonly code = "BCI";
  readonly name = "BCI";
}

export class RedBusAdapter extends NotConfiguredSupplierAdapter {
  readonly code = "REDBUS";
  readonly name = "RedBus";
}

export class AbhiBusAdapter extends NotConfiguredSupplierAdapter {
  readonly code = "ABHIBUS";
  readonly name = "AbhiBus";
}

export class TBOAdapter extends NotConfiguredSupplierAdapter {
  readonly code = "TBO";
  readonly name = "TBO";
}

export class CustomApiAdapter extends NotConfiguredSupplierAdapter {
  readonly code = "CUSTOM";
  readonly name = "Custom Bus API";
}

export class CustomAdapter extends CustomApiAdapter {}

export class MockSupplierAdapter implements SupplierAdapter {
  readonly code = "MOCK";
  readonly name = "Mock Supplier";
  private readonly holds = new Map<string, { tripId: string; hold: SeatHoldResponse }>();

  searchTrips(
    request: TripSearchRequest,
    context: SupplierOperationContext = {},
  ): Promise<TripSearchResponse> {
    const startedAt = Date.now();
    const trips = getMockSupplierTrips(request);
    const durationMs = Math.max(1, Date.now() - startedAt);
    const requestId = context.requestId ?? createIntegrationId("REQ");
    const correlationId = context.correlationId ?? requestId;

    return Promise.resolve({
      success: true,
      status: "AVAILABLE",
      trips,
      supplierResults: [
        {
          supplierCode: this.code,
          status: "SUCCESS",
          resultCount: trips.length,
          durationMs,
        },
      ],
      errors: [],
      duplicateGroups: [],
      requestId,
      correlationId,
    });
  }

  getTripDetails(request: SupplierTripDetailsRequest): Promise<BusSearchResult> {
    const trip = getMockTripById(request.tripId, request.journeyDate);

    if (!trip) {
      return Promise.reject(
        new SupplierValidationError(this.code, "GET_TRIP_DETAILS", "Trip not found"),
      );
    }

    return Promise.resolve(trip);
  }

  getSeatLayout(request: SeatLayoutRequest): Promise<SeatLayout> {
    return Promise.resolve(
      getMockSeatLayout({
        tripId: request.tripId,
        journeyDate: request.journeyDate,
        heldSeats: this.getActiveHeldSeats(request.tripId),
      }),
    );
  }

  holdSeats(request: SeatHoldRequest): Promise<SeatHoldResponse> {
    const layout = getMockSeatLayout({
      tripId: request.tripId,
      journeyDate: request.journeyDate,
      heldSeats: this.getActiveHeldSeats(request.tripId),
    });
    const hold = createMockSeatHold(request, layout);

    this.holds.set(hold.reservationId, { tripId: request.tripId, hold });

    return Promise.resolve(hold);
  }

  releaseSeats(request: SeatReleaseRequest): Promise<SeatReleaseResponse> {
    this.holds.delete(request.reservationId);

    return Promise.resolve(releaseMockSeatHold(request));
  }

  blockSeats(request: SeatBlockRequest): Promise<SeatBlockResponse> {
    return this.holdSeats({
      supplierCode: request.supplierCode,
      tripId: request.tripId,
      journeyDate: todayIsoDate(),
      seatNumbers: request.passengers.map((passenger) => passenger.seatNumber),
    }).then((hold) => ({
      blockId: hold.reservationId,
      expiresAt: hold.expiresAt,
      fare: hold.fare.grandTotal,
    }));
  }

  confirmBooking(request: SupplierConfirmBookingRequest): Promise<SupplierConfirmBookingResponse> {
    const suffix = request.blockId.slice(-8).replaceAll("-", "");

    return Promise.resolve({
      supplierBookingId: `MOCKSUP-${suffix}`,
      pnr: `PNR${suffix}`,
      ticketNumber: `VNT-${suffix}`,
      status: "CONFIRMED",
    });
  }

  getBookingStatus(request: SupplierBookingStatusRequest): Promise<SupplierBookingStatusResponse> {
    const suffix = request.supplierBookingId.slice(-8).replaceAll("-", "");

    return Promise.resolve({
      supplierBookingId: request.supplierBookingId,
      status: "CONFIRMED",
      pnr: `PNR${suffix}`,
      ticketNumber: `VNT-${suffix}`,
    });
  }

  cancelBooking(request: SupplierCancelBookingRequest): Promise<Cancellation> {
    return Promise.resolve({
      bookingId: request.bookingId ?? request.supplierBookingId,
      supplierBookingId: request.supplierBookingId,
      status: "CONFIRMED",
      refundStatus: "PENDING",
      penalty: money(0),
    });
  }

  rescheduleBooking(request: SupplierRescheduleBookingRequest): Promise<Reschedule> {
    return Promise.resolve({
      bookingId: request.bookingId ?? request.supplierBookingId,
      newTripId: request.targetTripId,
      newJourneyDate: request.journeyDate,
      fareDifference: money(0),
      status: "CONFIRMED",
    });
  }

  getTicket(request: SupplierTicketRequest): Promise<SupplierTicketResponse> {
    const suffix = request.supplierBookingId.slice(-8).replaceAll("-", "");

    return Promise.resolve({
      supplierBookingId: request.supplierBookingId,
      pnr: `PNR${suffix}`,
      ticketNumber: request.ticketNumber ?? `VNT-${suffix}`,
      status: "GENERATED",
      issuedAt: new Date().toISOString(),
    });
  }

  trackBus(request: TrackBusRequest): Promise<Tracking> {
    return Promise.resolve({
      supplierCode: request.supplierCode,
      tripId: request.tripId,
      status: "COMING_SOON",
    });
  }

  getCancellationPolicy(request: SupplierTripDetailsRequest): Promise<CancellationPolicy> {
    return Promise.resolve({
      supplierCode: request.supplierCode ?? this.code,
      tripId: request.tripId,
      slabs: [
        {
          beforeDepartureHours: 24,
          refundPercentage: 80,
          description: "Mock architecture policy for cancellations before 24 hours.",
        },
        {
          beforeDepartureHours: 6,
          refundPercentage: 50,
          description: "Mock architecture policy for same-day cancellation windows.",
        },
        {
          beforeDepartureHours: 0,
          refundPercentage: 0,
          description: "No mock refund after departure.",
        },
      ],
      terms: ["Supplier-specific terms stay normalized behind the adapter."],
    });
  }

  async getBoardingPoints(request: SupplierTripDetailsRequest): Promise<BoardingPoint[]> {
    return (await this.getSeatLayout(toSeatLayoutRequest(request))).boardingPoints;
  }

  async getDroppingPoints(request: SupplierTripDetailsRequest): Promise<DroppingPoint[]> {
    return (await this.getSeatLayout(toSeatLayoutRequest(request))).droppingPoints;
  }

  healthCheck(): Promise<SupplierHealth> {
    return Promise.resolve({
      supplierCode: this.code,
      status: "AVAILABLE",
      responseTimeMs: 8,
      successRate: 1,
      failureRate: 0,
      lastSuccessfulRequestAt: new Date().toISOString(),
      lastFailureAt: null,
      checkedAt: new Date().toISOString(),
      message: "Mock supplier is active. No external API call was made.",
    });
  }

  downloadTicket(request: TicketDownloadRequest): Promise<TicketDownloadResponse> {
    const content = `Mock ticket ${request.ticketNumber} for ${request.supplierBookingId}`;

    return Promise.resolve({
      fileName: `${request.ticketNumber}.pdf`,
      mimeType: "application/pdf",
      bytes: new TextEncoder().encode(content),
    });
  }

  private getActiveHeldSeats(tripId: string): string[] {
    const now = Date.now();

    return [...this.holds.values()]
      .filter((entry) => entry.tripId === tripId && Date.parse(entry.hold.expiresAt) > now)
      .flatMap((entry) => entry.hold.heldSeats);
  }
}

export const supplierAdapters = [
  MockSupplierAdapter,
  BCIAdapter,
  RedBusAdapter,
  AbhiBusAdapter,
  TBOAdapter,
  CustomApiAdapter,
] as const;

export function toSupplierError(
  error: unknown,
  supplierCode: SupplierCode,
  operation: SupplierOperation,
): SupplierError {
  if (error instanceof SupplierIntegrationError) {
    return error.toSupplierError();
  }

  return {
    supplierCode,
    operation,
    code: "SUPPLIER_UNAVAILABLE",
    message: error instanceof Error ? error.message : "Unknown supplier failure",
    retryable: true,
  };
}

function toSeatLayoutRequest(request: SupplierTripDetailsRequest): SeatLayoutRequest {
  return {
    supplierCode: request.supplierCode ?? "MOCK",
    tripId: request.tripId,
    journeyDate: request.journeyDate,
  };
}

function money(amount: number): Money {
  return {
    amount,
    currency: "INR",
  };
}

function createIntegrationId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}
