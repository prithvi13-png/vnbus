import type { Page, Route } from "@playwright/test";
import type {
  AdminBookingListResponse,
  AdminDashboardResponse,
  AgentDashboardResponse,
  BookingConfirmationResponse,
  BookingRecord,
  BusSearchResponse,
  BusSearchResult,
  CreateBookingRequest,
  NotificationRecord,
  SeatLayoutDetails,
  TicketRecord,
} from "@vnbus/types";

/**
 * Where the web app sends API calls under test (see the dev:test script).
 * Nothing listens there: every request is answered by the fake API below.
 */
export const TEST_API_ORIGIN = "http://127.0.0.1:3199";
const APP_ORIGIN = "http://127.0.0.1:3100";

/**
 * A test-only stand-in for the VNBUS API, answering the way the real one does
 * for one bus route. Bookings made through it are kept for the rest of the
 * test, so history, tickets and notifications follow from them.
 */
export class FakeApi {
  readonly bookings: BookingRecord[] = [];
  readonly notifications: NotificationRecord[] = [];
  adminBookings: BookingRecord[] = [];

  async handle(route: Route): Promise<void> {
    const request = route.request();

    if (request.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders() });
      return;
    }

    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api\/v1/u, "");
    const body = this.respond(request.method(), path, url, request.postData());

    await route.fulfill({
      status: body === undefined ? 404 : 200,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body ?? { statusCode: 404, message: `No fake for ${path}` }),
    });
  }

  private respond(method: string, path: string, url: URL, postData: string | null): unknown {
    const route = `${method} ${path}`;
    const bookingMatch = /^\/(bookings|tickets)\/([^/]+)(\/pdf|\/timeline)?$/u.exec(path);

    if (route === "POST /search") {
      return searchResponse(JSON.parse(postData ?? "{}") as { journeyDate: string });
    }
    if (route === "GET /search/cities") {
      const query = (url.searchParams.get("q") ?? "").toLowerCase();

      return [
        { name: "Bangalore", state: "Karnataka" },
        { name: "Hyderabad", state: "Telangana" },
      ].filter((city) => city.name.toLowerCase().startsWith(query));
    }
    if (method === "GET" && path.startsWith("/seats/")) {
      return seatLayout(
        decodeURIComponent(path.slice("/seats/".length)),
        url.searchParams.get("date") ?? "",
      );
    }
    if (route === "POST /bookings/create") {
      return this.createBooking(JSON.parse(postData ?? "{}") as CreateBookingRequest);
    }
    if (route === "GET /bookings/history") {
      return { bookings: this.bookings, timeline: [] };
    }
    if (method === "GET" && bookingMatch) {
      const booking = this.bookings.find((item) => item.bookingId === bookingMatch[2]);

      if (!booking) {
        return undefined;
      }
      if (bookingMatch[3] === "/timeline") {
        return [];
      }
      if (bookingMatch[1] === "tickets") {
        return bookingMatch[3] === "/pdf"
          ? { fileName: `${booking.bookingReference}.pdf`, mimeType: "application/pdf", base64: "" }
          : ticketFor(booking);
      }

      return booking;
    }
    if (route === "GET /notifications") {
      return this.notifications;
    }
    if (method === "POST" && path.startsWith("/notifications")) {
      return { unread: [], read: [], archived: [], history: [], counts: {} };
    }
    if (route === "GET /admin/dashboard") {
      return adminDashboard();
    }
    if (route === "GET /admin/bookings") {
      return {
        bookings: this.adminBookings.map((booking) => ({
          booking,
          customerName: `${booking.passengers[0]?.firstName} ${booking.passengers[0]?.lastName}`,
          agentName: null,
          ticket: null,
          timelineCount: 0,
        })),
        total: this.adminBookings.length,
        page: 1,
        pageSize: 500,
      } satisfies AdminBookingListResponse;
    }
    if (route === "GET /integrations/dashboard") {
      return {
        suppliers: [supplier("SRDV", "SRDV Technologies", true)],
        health: [],
        requestLogs: [],
        circuits: [],
        duplicateStrategy: "",
        security: {
          frontendSupplierAccess: "NEVER",
          credentialStorage: "SECRET_REFERENCES_ONLY",
          credentialLogging: "REDACTED",
        },
      };
    }
    if (route === "GET /integrations/configuration") {
      return {
        suppliers: [supplier("SRDV", "SRDV Technologies", true)],
        paymentProviders: [
          {
            code: "RAZORPAY",
            name: "Razorpay",
            enabled: false,
            environment: "SANDBOX_PLACEHOLDER",
            currency: "INR",
            credentialReference: null,
            configuration: {},
          },
        ],
      };
    }
    if (route === "GET /agent/dashboard") {
      return agentDashboard();
    }
    if (route === "GET /agent/customers") {
      return { customers: [], total: 0, page: 1, pageSize: 50 };
    }
    if (route === "GET /agent/bookings") {
      return { bookings: [], total: 0, page: 1, pageSize: 50 };
    }
    if (route === "GET /agent/notifications") {
      return [];
    }

    return undefined;
  }

  private createBooking(request: CreateBookingRequest): BookingConfirmationResponse {
    const trip = busTrip(1, request.journeyDate);
    const booking: BookingRecord = {
      bookingId: `00000000-0000-4000-8000-${String(this.bookings.length + 1).padStart(12, "0")}`,
      bookingReference: `VNB-TEST${String(this.bookings.length + 1).padStart(4, "0")}`,
      channel: "CUSTOMER",
      agentId: null,
      customerId: null,
      supplierCode: "SRDV",
      supplierBookingId: "90001",
      pnr: "PNR-TEST-1",
      ticketNumber: "TKT-TEST-1",
      status: "TICKET_GENERATED",
      trip,
      selectedSeats: request.selectedSeats,
      boardingPoint: { ...trip.boardingPoints[0]!, landmark: "" },
      droppingPoint: { ...trip.droppingPoints[0]!, landmark: "" },
      passengers: request.passengers,
      fare: fare(1050 * request.selectedSeats.length, 50 * request.selectedSeats.length),
      reservationId: "BLOCK-1",
      createdAt: new Date().toISOString(),
      expiresAt: null,
      confirmedAt: new Date().toISOString(),
      cancelledAt: null,
      emailPrepared: true,
    };

    this.bookings.unshift(booking);
    this.notifications.unshift({
      id: `ntf-${booking.bookingId}`,
      type: "BOOKING_UPDATE",
      readStatus: "UNREAD",
      title: "Ticket generated",
      body: `Ticket ${booking.ticketNumber} (PNR ${booking.pnr}) is ready.`,
      bookingId: booking.bookingId,
      createdAt: new Date().toISOString(),
      readAt: null,
    });

    return { booking, ticket: ticketFor(booking) };
  }
}

export async function useFakeApi(page: Page): Promise<FakeApi> {
  const api = new FakeApi();
  await page.route(`${TEST_API_ORIGIN}/**`, (route) => api.handle(route));

  return api;
}

/** A booking as the admin bookings list would return it. */
export function testBooking(reference: string): BookingRecord {
  const journeyDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const trip = busTrip(1, journeyDate);

  return {
    bookingId: "00000000-0000-4000-8000-0000000000b1",
    bookingReference: reference,
    channel: "CUSTOMER",
    agentId: null,
    customerId: null,
    supplierCode: "SRDV",
    supplierBookingId: "90001",
    pnr: "PNR-TEST-1",
    ticketNumber: "TKT-TEST-1",
    status: "TICKET_GENERATED",
    trip,
    selectedSeats: ["L1"],
    boardingPoint: { ...trip.boardingPoints[0]!, landmark: "" },
    droppingPoint: { ...trip.droppingPoints[0]!, landmark: "" },
    passengers: [
      {
        seatNumber: "L1",
        firstName: "Asha",
        lastName: "Rao",
        age: 31,
        gender: "FEMALE",
        phone: "+919000000001",
        email: "asha@test.invalid",
      },
    ],
    fare: fare(1050, 50),
    reservationId: "BLOCK-1",
    createdAt: new Date().toISOString(),
    expiresAt: null,
    confirmedAt: new Date().toISOString(),
    cancelledAt: null,
    emailPrepared: true,
  };
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": APP_ORIGIN,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function busTrip(index: number, journeyDate: string): BusSearchResult {
  const departure = new Date(`${journeyDate}T15:30:00.000Z`).toISOString();
  const arrival = new Date(Date.parse(departure) + 9 * 60 * 60 * 1000).toISOString();
  const point = (id: string, name: string, city: string, time: string) => ({
    id,
    name,
    city,
    address: `${name}, ${city}`,
    time,
    latitude: 0,
    longitude: 0,
  });

  return {
    supplierCode: "SRDV",
    tripId: `trace-1~${index}~result-${index}~6`,
    operatorName: `Test Travels ${index}`,
    busType: "Volvo A/C Sleeper (2+1)",
    sourceCity: "Bangalore",
    destinationCity: "Hyderabad",
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
    boardingPoints: [point("BP1", "Central Stand", "Bangalore", departure)],
    droppingPoints: [point("DP1", "City Stand", "Hyderabad", arrival)],
    rating: 0,
    reviewCount: 0,
    reviews: { rating: 0, reviewCount: 0, positiveTags: [] },
    discountLabel: null,
    discountAmount: 0,
    liveTracking: false,
    popularityScore: 0,
    routePreview: {
      from: { city: "Bangalore", latitude: 0, longitude: 0 },
      to: { city: "Hyderabad", latitude: 0, longitude: 0 },
      distanceKm: 0,
      mapBounds: [0, 0, 0, 0],
    },
    seatLayout: { totalSeats: 0, availableSeats: 2, decks: 2, layoutType: "SLEEPER" },
  };
}

function searchResponse(request: { journeyDate: string }): BusSearchResponse {
  const buses = [busTrip(1, request.journeyDate), busTrip(2, request.journeyDate)];

  return {
    success: true,
    totalResults: buses.length,
    buses,
    filters: {
      price: { min: 1050, max: 1050 },
      departureWindows: [],
      arrivalWindows: [],
      busTypes: [{ label: "Volvo A/C Sleeper (2+1)", value: "Volvo A/C Sleeper (2+1)", count: 2 }],
      operators: buses.map((bus) => ({
        label: bus.operatorName,
        value: bus.operatorName,
        count: 1,
      })),
      amenities: [],
      availableSeats: { min: 2, max: 2 },
      ratings: [],
    },
    pagination: {
      page: 1,
      pageSize: 12,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}

function seatLayout(tripId: string, journeyDate: string): SeatLayoutDetails {
  const trip = busTrip(1, journeyDate);
  const seat = (seatNumber: string, column: number, status: "AVAILABLE" | "BOOKED") => ({
    seatNumber,
    deck: "LOWER" as const,
    row: 0,
    column,
    kind: "SLEEPER" as const,
    status,
    fare: { amount: 1050, currency: "INR" as const },
    tax: { amount: 50, currency: "INR" as const },
    isWindow: false,
    isEmergencyExit: false,
    hasExtraLegroom: false,
    genderRestriction: null,
  });

  return {
    supplierCode: "SRDV",
    tripId,
    maxSelectableSeats: 6,
    holdDurationSeconds: 0,
    operatorName: trip.operatorName,
    busType: trip.busType,
    vehicleLayout: "Semi Sleeper",
    axleType: "Single Axle",
    sourceCity: trip.sourceCity,
    destinationCity: trip.destinationCity,
    journeyDate,
    departureTime: trip.departureTime,
    arrivalTime: trip.arrivalTime,
    durationMinutes: trip.durationMinutes,
    routePreview: trip.routePreview,
    boardingPoints: trip.boardingPoints.map((point) => ({ ...point, landmark: "" })),
    droppingPoints: trip.droppingPoints.map((point) => ({ ...point, landmark: "" })),
    decks: [
      {
        deck: "LOWER",
        label: "Lower deck",
        rows: 1,
        columns: 3,
        aisleAfterColumn: 0,
        seats: [seat("L1", 0, "AVAILABLE"), seat("L2", 1, "BOOKED"), seat("L3", 2, "AVAILABLE")],
      },
    ],
  };
}

function ticketFor(booking: BookingRecord): TicketRecord {
  return {
    ticketId: "TKT-1",
    bookingId: booking.bookingId,
    bookingReference: booking.bookingReference,
    ticketNumber: booking.ticketNumber ?? "",
    status: "GENERATED",
    pnr: booking.pnr ?? "",
    journeyDate: booking.trip.departureTime.slice(0, 10),
    operatorName: booking.trip.operatorName,
    busType: booking.trip.busType,
    route: `${booking.trip.sourceCity} to ${booking.trip.destinationCity}`,
    departureTime: booking.trip.departureTime,
    arrivalTime: booking.trip.arrivalTime,
    durationMinutes: booking.trip.durationMinutes,
    passengers: booking.passengers,
    seatNumbers: booking.selectedSeats,
    boardingPoint: booking.boardingPoint,
    droppingPoint: booking.droppingPoint,
    fare: booking.fare,
    bookingDate: booking.createdAt,
    bookingStatus: booking.status,
    trackingStatus: "COMING_SOON",
    terms: ["Carry a government issued photo ID while boarding."],
    emergencyContact: "Not provided",
    supportContact: { email: "info@vriddhinexus.com" },
    issuedAt: booking.confirmedAt ?? booking.createdAt,
    lastDownloadedAt: null,
    lastEmailedAt: null,
  };
}

function fare(total: number, tax: number) {
  return {
    baseFare: { amount: total - tax, currency: "INR" as const },
    taxes: { amount: tax, currency: "INR" as const },
    discount: { amount: 0, currency: "INR" as const },
    convenienceFee: { amount: 0, currency: "INR" as const },
    grandTotal: { amount: total, currency: "INR" as const },
  };
}

function supplier(code: "SRDV", name: string, enabled: boolean) {
  return {
    code,
    name,
    enabled,
    priority: 1,
    environment: "SANDBOX_PLACEHOLDER" as const,
    baseUrl: null,
    credentialReference: null,
    healthStatus: "UNKNOWN" as const,
    timeout: {
      connectionTimeoutMs: 1500,
      requestTimeoutMs: 20000,
      retryCount: 1,
      retryDelayMs: 150,
      circuitBreakerThreshold: 3,
      circuitBreakerCooldownMs: 30000,
    },
  };
}

function adminDashboard(): AdminDashboardResponse {
  const queue = (name: string) => ({ name, queued: 0, sent: 0, failed: 0, retryScheduled: 0 });

  return {
    metrics: {
      todaysBookings: 0,
      weeklyBookings: 0,
      monthlyBookings: 0,
      revenue: { amount: 0, currency: "INR" },
      users: 0,
      travelAgents: 0,
      upcomingJourneys: 0,
      cancelledBookings: 0,
    },
    cards: [
      { label: "Today's Bookings", value: "0", change: "Since midnight IST", tone: "neutral" },
    ],
    bookingTrends: [],
    popularRoutes: [],
    topOperators: [],
    mostActiveCustomers: [],
    recentActivities: [],
    systemHealth: [],
    emailQueueStatus: queue("Email Queue"),
    notificationQueueStatus: queue("Notification Queue"),
  };
}

function agentDashboard(): AgentDashboardResponse {
  return {
    profile: {
      agentId: "agent-1",
      agencyName: "Test Agency",
      agencyAddress: "",
      contactName: "Test Agent",
      email: "agent@test.invalid",
      phone: "+910000000000",
      logoUrl: null,
      status: "ACTIVE",
      commissionRate: 0,
      emailPreferences: {
        bookingConfirmation: true,
        cancellation: true,
        reschedule: true,
        journeyReminder: true,
      },
      notificationPreferences: { inApp: true, email: true, system: true },
    },
    metrics: {
      todaysBookings: 0,
      upcomingJourneys: 0,
      todaysRevenue: { amount: 0, currency: "INR" },
      cancelledBookings: 0,
    },
    recentCustomers: [],
    recentActivity: [],
    quickBookingRoutes: [],
    popularRoutes: [],
    bookingStatusSummary: [],
    notifications: [],
  };
}
