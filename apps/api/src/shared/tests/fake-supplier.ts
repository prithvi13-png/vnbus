import {
  NotImplementedSupplierError,
  type SeatBlockRequest,
  type SeatBlockResponse,
  type SeatLayoutRequest,
  type SupplierAdapter,
  type SupplierCancelBookingRequest,
  type SupplierConfirmBookingRequest,
  type SupplierConfirmBookingResponse,
} from "@vnbus/supplier-sdk";
import type {
  BusPoint,
  BusSearchResult,
  Cancellation,
  SeatLayoutDetails,
  SeatMapSeat,
  SupplierHealth,
  SupplierOperation,
  TripSearchRequest,
  TripSearchResponse,
} from "@vnbus/types";

/**
 * A test double for the SRDV supplier: two buses on any route, a four-seat
 * map, and a block/book/cancel that answer like SRDV. Every call is recorded
 * so tests can assert on what would have gone to the supplier.
 */
export class FakeSupplierAdapter implements SupplierAdapter {
  readonly code = "SRDV" as const;
  readonly name = "Test supplier";
  readonly calls: Array<{ operation: string; request: unknown }> = [];
  failBlock: Error | null = null;
  failBook: Error | null = null;

  searchTrips(request: TripSearchRequest): Promise<TripSearchResponse> {
    this.calls.push({ operation: "search", request });
    const trips = [1, 2].map((index) => trip(request, index));

    return Promise.resolve({
      success: true,
      status: "AVAILABLE",
      trips,
      supplierResults: [
        { supplierCode: this.code, status: "SUCCESS", resultCount: trips.length, durationMs: 1 },
      ],
      errors: [],
      duplicateGroups: [],
      requestId: "test",
      correlationId: "test",
    });
  }

  getSeatLayout(request: SeatLayoutRequest): Promise<SeatLayoutDetails> {
    this.calls.push({ operation: "seat-layout", request });

    return Promise.resolve({
      supplierCode: this.code,
      tripId: request.tripId,
      maxSelectableSeats: 6,
      holdDurationSeconds: 0,
      operatorName: "",
      busType: "",
      vehicleLayout: "Semi Sleeper",
      axleType: "Single Axle",
      sourceCity: "",
      destinationCity: "",
      journeyDate: request.journeyDate,
      departureTime: "",
      arrivalTime: "",
      durationMinutes: 0,
      routePreview: {
        from: { city: "", latitude: 0, longitude: 0 },
        to: { city: "", latitude: 0, longitude: 0 },
        distanceKm: 0,
        mapBounds: [0, 0, 0, 0],
      },
      boardingPoints: [],
      droppingPoints: [],
      decks: [
        {
          deck: "LOWER",
          label: "Lower deck",
          rows: 1,
          columns: 3,
          aisleAfterColumn: 0,
          seats: [
            seat("L1", 0, "AVAILABLE"),
            seat("L2", 1, "BOOKED"),
            seat("L3", 2, "LADIES", "LADIES"),
          ],
        },
        {
          deck: "UPPER",
          label: "Upper deck",
          rows: 1,
          columns: 1,
          aisleAfterColumn: 0,
          seats: [{ ...seat("U1", 0, "AVAILABLE"), deck: "UPPER" }],
        },
      ],
    });
  }

  blockSeats(request: SeatBlockRequest): Promise<SeatBlockResponse> {
    this.calls.push({ operation: "block", request });
    if (this.failBlock) {
      return Promise.reject(this.failBlock);
    }

    return Promise.resolve({
      blockId: "BLOCK-1",
      expiresAt: "",
      fare: { amount: request.passengers.length * 1050, currency: "INR" },
    });
  }

  confirmBooking(request: SupplierConfirmBookingRequest): Promise<SupplierConfirmBookingResponse> {
    this.calls.push({ operation: "book", request });
    if (this.failBook) {
      return Promise.reject(this.failBook);
    }

    return Promise.resolve({
      supplierBookingId: "90001",
      pnr: "PNR-TEST-1",
      ticketNumber: "TKT-TEST-1",
      status: "CONFIRMED",
    });
  }

  cancelBooking(request: SupplierCancelBookingRequest): Promise<Cancellation> {
    this.calls.push({ operation: "cancel", request });

    return Promise.resolve({
      bookingId: request.bookingId ?? request.supplierBookingId,
      supplierBookingId: request.supplierBookingId,
      status: "REQUESTED",
      refundStatus: "PENDING",
      penalty: { amount: 0, currency: "INR" },
    });
  }

  healthCheck(): Promise<SupplierHealth> {
    return Promise.resolve({
      supplierCode: this.code,
      status: "AVAILABLE",
      responseTimeMs: 1,
      successRate: 1,
      failureRate: 0,
      lastSuccessfulRequestAt: null,
      lastFailureAt: null,
      checkedAt: new Date().toISOString(),
      message: "Test supplier.",
    });
  }

  getTripDetails(): Promise<never> {
    return this.notImplemented("GET_TRIP_DETAILS");
  }

  holdSeats(): Promise<never> {
    return this.notImplemented("HOLD_SEATS");
  }

  releaseSeats(): Promise<never> {
    return this.notImplemented("RELEASE_SEATS");
  }

  getBookingStatus(): Promise<never> {
    return this.notImplemented("GET_BOOKING_STATUS");
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

  getBoardingPoints(): Promise<never> {
    return this.notImplemented("GET_BOARDING_POINTS");
  }

  getDroppingPoints(): Promise<never> {
    return this.notImplemented("GET_DROPPING_POINTS");
  }

  downloadTicket(): Promise<never> {
    return this.notImplemented("GET_TICKET");
  }

  private notImplemented(operation: SupplierOperation): Promise<never> {
    return Promise.reject(new NotImplementedSupplierError(this.code, operation));
  }
}

function seat(
  seatNumber: string,
  column: number,
  status: SeatMapSeat["status"],
  genderRestriction: SeatMapSeat["genderRestriction"] = null,
): SeatMapSeat {
  return {
    seatNumber,
    deck: "LOWER",
    row: 0,
    column,
    kind: "SEATER",
    status,
    fare: { amount: 1050, currency: "INR" },
    tax: { amount: 50, currency: "INR" },
    isWindow: false,
    isEmergencyExit: false,
    hasExtraLegroom: false,
    genderRestriction,
  };
}

function point(id: string, name: string, city: string, time: string): BusPoint {
  return { id, name, city, address: `${name}, ${city}`, time, latitude: 0, longitude: 0 };
}

/** A bus departing 21:00 IST on the journey date, arriving 06:00 IST next day. */
function trip(request: TripSearchRequest, index: number): BusSearchResult {
  const departure = new Date(`${request.journeyDate}T15:30:00.000Z`).toISOString();
  const arrival = new Date(Date.parse(departure) + 9 * 60 * 60 * 1000).toISOString();

  return {
    supplierCode: "SRDV",
    tripId: `trace-1~${index}~result-${index}~6`,
    operatorName: `Test Travels ${index}`,
    busType: "Volvo A/C Sleeper (2+1)",
    sourceCity: request.sourceCity,
    destinationCity: request.destinationCity,
    departureTime: departure,
    arrivalTime: arrival,
    durationMinutes: 540,
    availableSeats: 2,
    fare: { amount: 1050, currency: "INR" },
    routeId: `route-${index}`,
    operatorId: `operator-${index}`,
    operatorLogoUrl: "",
    busImageUrl: "",
    amenities: [],
    boardingPoints: [point("BP1", "Central Stand", request.sourceCity, departure)],
    droppingPoints: [point("DP1", "City Stand", request.destinationCity, arrival)],
    rating: 0,
    reviewCount: 0,
    reviews: { rating: 0, reviewCount: 0, positiveTags: [] },
    discountLabel: null,
    discountAmount: 0,
    liveTracking: false,
    popularityScore: 0,
    routePreview: {
      from: { city: request.sourceCity, latitude: 0, longitude: 0 },
      to: { city: request.destinationCity, latitude: 0, longitude: 0 },
      distanceKm: 0,
      mapBounds: [0, 0, 0, 0],
    },
    seatLayout: { totalSeats: 0, availableSeats: 2, decks: 2, layoutType: "SLEEPER" },
  };
}
