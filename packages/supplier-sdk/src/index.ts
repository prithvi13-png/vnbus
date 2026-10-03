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
export const SUPPLIER_CODES = ["BCI", "REDBUS", "ABHIBUS", "TBO", "SRDV", "CUSTOM"] as const;

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

/**
 * A passenger on a block request. Only the seat is required by the type; real
 * suppliers demand identity as well. SRDV's Block rejects a passenger without
 * a name, age, gender and lead flag, so its adapter validates these up front
 * rather than sending a partial booking.
 */
export interface SupplierBlockPassenger {
  seatNumber: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  age?: number;
  email?: string;
  phone?: string;
  /** Exactly one passenger on a booking is the lead. */
  isLeadPassenger?: boolean;
  idNumber?: string;
  idType?: string;
  address?: string;
}

export interface SeatBlockRequest {
  tripId: string;
  supplierCode: SupplierCode;
  passengers: SupplierBlockPassenger[];
  contactEmail: string;
  contactPhone: string;
  /** Boarding/dropping point ids, as returned by the supplier's point list. */
  boardingPointId?: string;
  droppingPointId?: string;
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
  /**
   * The trip this booking belongs to. SRDV's Book is keyed by the search's
   * TraceId/SrdvIndex/ResultIndex rather than by the block handle, and those
   * live in the tripId — a blockId alone cannot address the booking.
   */
  tripId?: string;
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
  /**
   * SRDV cancels by the search's TraceId (carried in tripId) plus the seat
   * name, not by booking id — and it cancels one seat at a time, which is what
   * its PartialCancellationAllowed flag refers to.
   */
  tripId?: string;
  seatName?: string;
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

export const supplierAdapters = [
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

export * from "./srdv/index.js";
