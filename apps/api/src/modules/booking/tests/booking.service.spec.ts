import {
  ConflictException,
  GoneException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { SupplierBookingFailedError, SupplierSeatUnavailableError } from "@vnbus/supplier-sdk";

import {
  bookingRequest,
  createBookingHarness,
  futureDate,
  principal,
  searchTrip,
} from "../../../shared/tests/booking-harness";

describe("BookingService", () => {
  it("returns module readiness and capabilities", () => {
    const { bookingService } = createBookingHarness();
    const summary = bookingService.getSummary();

    expect(summary.module).toBe("booking");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("blocks and books the seats with the supplier and issues its ticket", async () => {
    const harness = createBookingHarness();
    const journeyDate = futureDate();
    const trip = await searchTrip(harness.supplierManager, journeyDate);

    const { booking, ticket } = await harness.bookingService.createBooking(
      bookingRequest(trip, journeyDate),
      principal(),
    );

    expect(booking.status).toBe("TICKET_GENERATED");
    expect(booking.pnr).toBe("PNR-TEST-1");
    expect(booking.ticketNumber).toBe("TKT-TEST-1");
    expect(booking.supplierBookingId).toBe("90001");
    expect(booking.reservationId).toBe("BLOCK-1");
    expect(booking.trip.operatorName).toBe(trip.operatorName);
    expect(booking.fare.grandTotal.amount).toBe(1050);
    expect(booking.fare.taxes.amount).toBe(50);
    expect(ticket.pnr).toBe("PNR-TEST-1");
    expect(harness.supplier.calls.map((call) => call.operation)).toEqual([
      "search",
      "seat-layout",
      "block",
      "book",
    ]);
  });

  it("sends SRDV a title, the lead passenger, and the chosen points", async () => {
    const harness = createBookingHarness();
    const journeyDate = futureDate();
    const trip = await searchTrip(harness.supplierManager, journeyDate);

    await harness.bookingService.createBooking(bookingRequest(trip, journeyDate), principal());

    const block = harness.supplier.calls.find((call) => call.operation === "block")?.request as {
      boardingPointId: string;
      droppingPointId: string;
      passengers: Array<{ title: string; isLeadPassenger: boolean }>;
    };
    expect(block.boardingPointId).toBe("BP1");
    expect(block.droppingPointId).toBe("DP1");
    expect(block.passengers[0]).toMatchObject({ title: "Ms", isLeadPassenger: true });
  });

  it("keeps a FAILED booking when the supplier will not sell the seat", async () => {
    const harness = createBookingHarness();
    const journeyDate = futureDate();
    const trip = await searchTrip(harness.supplierManager, journeyDate);
    harness.supplier.failBook = new SupplierBookingFailedError("SRDV", "Booking declined");

    await expect(
      harness.bookingService.createBooking(bookingRequest(trip, journeyDate), principal()),
    ).rejects.toBeInstanceOf(ConflictException);

    const [booking] = await harness.bookingService.listBookings(principal());
    expect(booking?.status).toBe("FAILED");
    expect(booking?.pnr).toBeNull();
  });

  it("reports a seat the supplier refused to block without saving anything", async () => {
    const harness = createBookingHarness();
    const journeyDate = futureDate();
    const trip = await searchTrip(harness.supplierManager, journeyDate);
    harness.supplier.failBlock = new SupplierSeatUnavailableError("SRDV", "Seat L1 is taken");

    await expect(
      harness.bookingService.createBooking(bookingRequest(trip, journeyDate), principal()),
    ).rejects.toThrow("Seat L1 is taken");
    expect(await harness.bookingService.listBookings(principal())).toHaveLength(0);
  });

  it("still returns the ticket when saving the sale fails", async () => {
    const harness = createBookingHarness();
    const journeyDate = futureDate();
    const trip = await searchTrip(harness.supplierManager, journeyDate);
    const create = harness.prisma.booking.create;
    harness.prisma.booking.create = async (args) => {
      const row = await create(args);
      harness.prisma.failNextBookingUpdate = true;

      return row;
    };

    const { booking } = await harness.bookingService.createBooking(
      bookingRequest(trip, journeyDate),
      principal(),
    );

    expect(booking.pnr).toBe("PNR-TEST-1");
  });

  it("asks for a fresh search when the trip is no longer cached", async () => {
    const harness = createBookingHarness();
    const journeyDate = futureDate();
    const trip = await searchTrip(harness.supplierManager, journeyDate);

    await expect(
      harness.bookingService.createBooking(
        bookingRequest({ ...trip, tripId: "expired~1~1~6" }, journeyDate),
        principal(),
      ),
    ).rejects.toBeInstanceOf(GoneException);
  });

  it("refuses a seat that sold since the map was opened", async () => {
    const harness = createBookingHarness();
    const journeyDate = futureDate();
    const trip = await searchTrip(harness.supplierManager, journeyDate);
    const request = bookingRequest(trip, journeyDate, {
      selectedSeats: ["L2"],
      passengers: [{ ...bookingRequest(trip, journeyDate).passengers[0]!, seatNumber: "L2" }],
    });

    await expect(harness.bookingService.createBooking(request, principal())).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(harness.supplier.calls.some((call) => call.operation === "block")).toBe(false);
  });

  it("keeps women-only seats for women passengers", async () => {
    const harness = createBookingHarness();
    const journeyDate = futureDate();
    const trip = await searchTrip(harness.supplierManager, journeyDate);
    const passenger = bookingRequest(trip, journeyDate).passengers[0]!;
    const request = bookingRequest(trip, journeyDate, {
      selectedSeats: ["L3"],
      passengers: [{ ...passenger, seatNumber: "L3", gender: "MALE" }],
    });

    await expect(harness.bookingService.createBooking(request, principal())).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("shows a booking only to its owner and to admins", async () => {
    const harness = createBookingHarness();
    const journeyDate = futureDate();
    const trip = await searchTrip(harness.supplierManager, journeyDate);
    const { booking } = await harness.bookingService.createBooking(
      bookingRequest(trip, journeyDate),
      principal(),
    );
    const stranger = principal({ sub: "00000000-0000-4000-8000-000000000002" });

    await expect(
      harness.bookingService.getBookingForUser(booking.bookingId, stranger),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(await harness.bookingService.listBookings(stranger)).toHaveLength(0);
    await expect(
      harness.bookingService.getBookingForUser(
        booking.bookingId,
        principal({ sub: stranger.sub, roles: ["ADMIN"] }),
      ),
    ).resolves.toMatchObject({ bookingId: booking.bookingId });
  });

  it("cancels each seat with the supplier and leaves the refund pending", async () => {
    const harness = createBookingHarness();
    const journeyDate = futureDate();
    const trip = await searchTrip(harness.supplierManager, journeyDate);
    const { booking } = await harness.bookingService.createBooking(
      bookingRequest(trip, journeyDate),
      principal(),
    );

    const response = await harness.bookingService.cancelBooking(
      { bookingId: booking.bookingId, reason: "Plans changed" },
      principal(),
    );

    expect(response.booking.status).toBe("CANCELLATION_REQUESTED");
    expect(response.refundStatus).toBe("REFUND_PENDING");
    expect(response.timeline.map((event) => event.type)).toEqual(
      expect.arrayContaining(["CANCELLATION_REQUESTED", "REFUND_PENDING"]),
    );
    expect(harness.supplier.calls.filter((call) => call.operation === "cancel")).toHaveLength(1);
    await expect(
      harness.bookingService.cancelBooking({ bookingId: booking.bookingId }, principal()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("records the booking's lifecycle on its timeline", async () => {
    const harness = createBookingHarness();
    const journeyDate = futureDate();
    const trip = await searchTrip(harness.supplierManager, journeyDate);
    const { booking } = await harness.bookingService.createBooking(
      bookingRequest(trip, journeyDate),
      principal(),
    );

    const timeline = await harness.bookingService.getTimeline(booking.bookingId, principal());

    expect(timeline.map((event) => event.type)).toEqual(
      expect.arrayContaining(["SEAT_RESERVED", "TICKET_GENERATED", "EMAIL_SENT"]),
    );
  });
});
