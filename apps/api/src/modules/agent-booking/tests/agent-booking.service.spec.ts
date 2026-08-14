import type { BookingRecord, TicketRecord } from "@vnbus/types";

import { AgentBookingMapper } from "../mappers/agent-booking.mapper";
import { AgentBookingRepository } from "../repositories/agent-booking.repository";
import { AgentBookingService } from "../services/agent-booking.service";
import { AgentBookingValidator } from "../validators/agent-booking.validator";

describe("AgentBookingService", () => {
  it("creates an agent-owned booking through shared booking and ticket services", async () => {
    const booking = mockBooking();
    const ticket = mockTicket(booking);
    const createBooking = jest.fn().mockResolvedValue(booking);
    const confirmBooking = jest.fn().mockResolvedValue({ booking, ticket });
    const upsertBooking = jest.fn((record: BookingRecord) => record);
    const emailTicket = jest.fn().mockResolvedValue({
      bookingId: booking.bookingId,
      ticketId: ticket.ticketId,
      queued: true,
      emailLogId: "EML-AGENT-001",
      status: "SENT",
    });
    const service = new AgentBookingService(
      new AgentBookingRepository(),
      new AgentBookingValidator(),
      {
        createBooking,
        confirmBooking,
        upsertBooking,
        listBookings: () => [],
        getBooking: () => booking,
      } as never,
      { emailTicket, getTicket: () => ticket } as never,
      {
        ensureBookable: () => ({
          customerId: "CUS-AGT-001",
          name: "Aarav Sharma",
          email: "aarav.sharma@example.com",
          phone: "+919876543210",
          gender: "MALE",
          dateOfBirth: null,
          emergencyContact: null,
          preferredRoutes: [],
          notes: [],
          tags: [],
          status: "ACTIVE",
          bookingCount: 0,
          upcomingTrips: 0,
          lifetimeValue: { amount: 0, currency: "INR" },
          lastBookedAt: null,
          createdAt: booking.createdAt,
          updatedAt: booking.createdAt,
        }),
        recordBooking: jest.fn(),
        getCustomer: jest.fn(),
        findByPhoneOrEmail: jest.fn(),
      } as never,
      { recordActivity: jest.fn() } as never,
      new AgentBookingMapper(),
    );

    const response = await service.createBooking({
      reservationId: booking.reservationId,
      supplierCode: booking.supplierCode,
      tripId: booking.trip.tripId,
      journeyDate: "2026-09-10",
      selectedSeats: booking.selectedSeats,
      boardingPointId: booking.boardingPoint.id,
      droppingPointId: booking.droppingPoint.id,
      passengers: booking.passengers,
      customerId: "CUS-AGT-001",
      emailTicket: true,
    });

    expect(createBooking).toHaveBeenCalledTimes(1);
    expect(confirmBooking).toHaveBeenCalledWith({
      bookingId: booking.bookingId,
      paymentReference: "AGENT-MOCK-PAYMENT",
    });
    expect(upsertBooking).toHaveBeenCalledWith(expect.objectContaining({ channel: "AGENT" }));
    expect(emailTicket).toHaveBeenCalledWith({
      bookingId: booking.bookingId,
      to: "aarav.sharma@example.com",
    });
    expect(response.emailLogId).toBe("EML-AGENT-001");
  });
});

function mockBooking(): BookingRecord {
  const createdAt = "2026-08-08T09:00:00.000Z";

  return {
    bookingId: "BKG-AGENT-001",
    bookingReference: "VNB-AGENT-001",
    supplierCode: "MOCK",
    supplierBookingId: null,
    pnr: "PNRAGENT01",
    ticketNumber: "VNT-AGENT-001",
    status: "TICKET_GENERATED",
    trip: {
      supplierCode: "MOCK",
      tripId: "mock-route-001-1",
      operatorName: "Vriddhi Express",
      busType: "AC Sleeper",
      sourceCity: "Bangalore",
      destinationCity: "Hyderabad",
      departureTime: "2026-09-10T06:00:00.000Z",
      arrivalTime: "2026-09-10T18:15:00.000Z",
      durationMinutes: 735,
      availableSeats: 24,
      fare: { amount: 1600, currency: "INR" },
      routeId: "route-001",
      operatorId: "operator-001",
      operatorLogoUrl: "",
      busImageUrl: "",
      amenities: ["WiFi"],
      boardingPoints: [],
      droppingPoints: [],
      rating: 4.5,
      reviewCount: 120,
      reviews: { rating: 4.5, reviewCount: 120, positiveTags: ["Clean"] },
      discountLabel: null,
      discountAmount: 0,
      liveTracking: true,
      popularityScore: 90,
      routePreview: {
        from: { city: "Bangalore", latitude: 12.97, longitude: 77.59 },
        to: { city: "Hyderabad", latitude: 17.38, longitude: 78.48 },
        distanceKm: 570,
        mapBounds: [12.97, 77.59, 17.38, 78.48],
      },
      seatLayout: { totalSeats: 36, availableSeats: 24, decks: 2, layoutType: "SLEEPER" },
    },
    selectedSeats: ["L1B"],
    boardingPoint: {
      id: "bp-1",
      name: "Bangalore Central Bus Stand",
      city: "Bangalore",
      address: "Majestic",
      time: "06:00",
      latitude: 12.97,
      longitude: 77.59,
      landmark: "Metro",
    },
    droppingPoint: {
      id: "dp-1",
      name: "Hyderabad Central Bus Stand",
      city: "Hyderabad",
      address: "MGBS",
      time: "18:15",
      latitude: 17.38,
      longitude: 78.48,
      landmark: "Main gate",
    },
    passengers: [
      {
        seatNumber: "L1B",
        firstName: "Aarav",
        lastName: "Sharma",
        age: 32,
        gender: "MALE",
        phone: "+919876543210",
        email: "aarav.sharma@example.com",
      },
    ],
    fare: {
      baseFare: { amount: 1490, currency: "INR" },
      taxes: { amount: 75, currency: "INR" },
      discount: { amount: 0, currency: "INR" },
      convenienceFee: { amount: 35, currency: "INR" },
      grandTotal: { amount: 1600, currency: "INR" },
    },
    reservationId: "RES-AGENT-001",
    createdAt,
    expiresAt: null,
    confirmedAt: createdAt,
    emailPrepared: true,
  };
}

function mockTicket(booking: BookingRecord): TicketRecord {
  return {
    ticketId: "TKT-AGENT-001",
    bookingId: booking.bookingId,
    bookingReference: booking.bookingReference,
    ticketNumber: "VNT-AGENT-001",
    status: "GENERATED",
    pnr: "PNRAGENT01",
    journeyDate: "2026-09-10",
    operatorName: "Vriddhi Express",
    busType: "AC Sleeper",
    busNumber: "KA-40-VN-1001",
    route: "Bangalore to Hyderabad",
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
    qrCode: {
      payload: {
        bookingId: booking.bookingId,
        pnr: "PNRAGENT01",
        journeyDate: "2026-09-10",
        passengerCount: 1,
        verificationUrl: "https://mock.vriddhinexus.local/verify/BKG-AGENT-001",
      },
      data: "{}",
      svg: "<svg />",
      dataUrl: "data:image/svg+xml;base64,",
    },
    qrPayload: "{}",
    trackingStatus: "COMING_SOON",
    terms: ["Carry ID."],
    emergencyContact: "+918045678899",
    supportContact: {
      phone: "+918045678899",
      email: "support@example.com",
      hours: "24x7",
    },
    issuedAt: booking.createdAt,
  };
}
