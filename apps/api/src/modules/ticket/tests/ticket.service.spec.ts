import { BadRequestException, NotFoundException } from "@nestjs/common";

import {
  bookingRequest,
  createBookingHarness,
  futureDate,
  principal,
  searchTrip,
} from "../../../shared/tests/booking-harness";

async function bookedTicket() {
  const harness = createBookingHarness();
  const journeyDate = futureDate();
  const trip = await searchTrip(harness.supplierManager, journeyDate);
  const confirmation = await harness.bookingService.createBooking(
    bookingRequest(trip, journeyDate),
    principal(),
  );

  return { ...harness, booking: confirmation.booking };
}

describe("TicketService", () => {
  it("returns module readiness and capabilities", () => {
    const { ticketService } = createBookingHarness();
    const summary = ticketService.getSummary();

    expect(summary.module).toBe("ticket");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("builds the ticket from the supplier's PNR and ticket number", async () => {
    const { booking, ticketService } = await bookedTicket();

    const ticket = await ticketService.getTicket(booking.bookingId, principal());

    expect(ticket.pnr).toBe("PNR-TEST-1");
    expect(ticket.ticketNumber).toBe("TKT-TEST-1");
    expect(ticket.supportContact.email).toContain("@");
    expect(ticket.route).toBe("Bangalore to Hyderabad");
  });

  it("downloads a PDF and records it on the timeline", async () => {
    const { booking, ticketService, timelineService } = await bookedTicket();

    const pdf = await ticketService.downloadTicketPdf(booking.bookingId, principal());
    const decoded = Buffer.from(pdf.base64, "base64").toString("binary");

    expect(pdf.mimeType).toBe("application/pdf");
    expect(decoded.startsWith("%PDF-1.4")).toBe(true);
    expect(decoded).toContain("PNR: PNR-TEST-1");
    expect(
      (await timelineService.listForBookings([booking.bookingId])).map((event) => event.type),
    ).toContain("TICKET_DOWNLOADED");
    expect((await ticketService.getTicket(booking.bookingId, principal())).status).toBe(
      "DOWNLOADED",
    );
  });

  it("emails the ticket to the lead passenger by default", async () => {
    const { booking, ticketService } = await bookedTicket();

    const response = await ticketService.emailTicket({ bookingId: booking.bookingId }, principal());

    expect(response.queued).toBe(true);
    expect(response.bookingId).toBe(booking.bookingId);
  });

  it("does not show another user's ticket", async () => {
    const { booking, ticketService } = await bookedTicket();

    await expect(
      ticketService.getTicket(
        booking.bookingId,
        principal({ sub: "00000000-0000-4000-8000-000000000009" }),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("has no ticket for a booking the supplier did not sell", async () => {
    const harness = createBookingHarness();
    const journeyDate = futureDate();
    const trip = await searchTrip(harness.supplierManager, journeyDate);
    harness.supplier.failBook = new Error("SRDV unavailable");
    await harness.bookingService
      .createBooking(bookingRequest(trip, journeyDate), principal())
      .catch(() => undefined);
    const [failed] = await harness.bookingService.listBookings(principal());

    await expect(
      harness.ticketService.getTicket(failed!.bookingId, principal()),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
