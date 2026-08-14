import { EmailLoggerService } from "../../../shared/email/email-logger.service";
import { EmailQueueService } from "../../../shared/email/email-queue.service";
import { EmailRetryStrategy } from "../../../shared/email/email-retry.strategy";
import { EmailTemplateService } from "../../../shared/email/email-template.service";
import { BookingRepository } from "../../booking/repositories/booking.repository";
import { BookingService } from "../../booking/services/booking.service";
import { BookingModuleValidator } from "../../booking/validators/booking.validator";
import { DistributedLockService } from "../../integration/services/distributed-lock.service";
import { IdempotencyService } from "../../integration/services/idempotency.service";
import { createTestSupplierManager } from "../../integration/tests/integration-test-helpers";
import { NotificationRepository } from "../../notification/repositories/notification.repository";
import { NotificationService } from "../../notification/services/notification.service";
import { NotificationModuleValidator } from "../../notification/validators/notification.validator";
import { SeatRepository } from "../../seat/repositories/seat.repository";
import { SeatService } from "../../seat/services/seat.service";
import { SeatModuleValidator } from "../../seat/validators/seat.validator";
import { TimelineRepository } from "../../timeline/repositories/timeline.repository";
import { TimelineService } from "../../timeline/services/timeline.service";
import { TimelineModuleValidator } from "../../timeline/validators/timeline.validator";
import { TicketMapper } from "../mappers/ticket.mapper";
import { TicketRepository } from "../repositories/ticket.repository";
import { TicketService } from "../services/ticket.service";
import { TicketModuleValidator } from "../validators/ticket.validator";

describe("TicketService", () => {
  const createServices = (): {
    bookingService: BookingService;
    seatService: SeatService;
    ticketService: TicketService;
  } => {
    const seatService = new SeatService(
      new SeatRepository(),
      new SeatModuleValidator(),
      createTestSupplierManager(),
      new IdempotencyService(),
      new DistributedLockService(),
    );
    const emailService = new EmailQueueService(
      new EmailTemplateService(),
      new EmailLoggerService(),
      new EmailRetryStrategy(),
    );
    const timelineService = new TimelineService(
      new TimelineRepository(),
      new TimelineModuleValidator(),
    );
    const notificationService = new NotificationService(
      new NotificationRepository(),
      new NotificationModuleValidator(),
    );
    const bookingService = new BookingService(
      new BookingRepository(),
      new BookingModuleValidator(),
      seatService,
      emailService,
      timelineService,
      notificationService,
    );
    const ticketService = new TicketService(
      new TicketRepository(),
      new TicketModuleValidator(),
      bookingService,
      new TicketMapper(),
      emailService,
      timelineService,
      notificationService,
    );

    return { bookingService, seatService, ticketService };
  };

  it("returns module readiness and capabilities", () => {
    const { ticketService } = createServices();
    const summary = ticketService.getSummary();

    expect(summary.module).toBe("ticket");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("generates a ticket and mock PDF for a confirmed booking", async () => {
    const { bookingService, seatService, ticketService } = createServices();
    const journeyDate = tomorrowIsoDate();
    const layout = await seatService.getSeatLayout("mock-route-001-1", journeyDate);
    const seat = layout.decks
      .flatMap((deck) => deck.seats)
      .find((item) => item.status === "AVAILABLE");
    const seatNumber = seat?.seatNumber ?? "1A";
    const hold = await seatService.holdSeats({
      supplierCode: "MOCK",
      tripId: layout.tripId,
      journeyDate,
      seatNumbers: [seatNumber],
    });
    const booking = await bookingService.createBooking({
      reservationId: hold.reservationId,
      supplierCode: "MOCK",
      tripId: layout.tripId,
      journeyDate,
      selectedSeats: [seatNumber],
      boardingPointId: layout.boardingPoints[0]?.id ?? "",
      droppingPointId: layout.droppingPoints[0]?.id ?? "",
      passengers: [
        {
          seatNumber,
          firstName: "Meera",
          lastName: "Rao",
          age: 29,
          gender: "FEMALE",
          phone: "+919876543211",
          email: "meera@example.com",
        },
      ],
    });
    const confirmation = await bookingService.confirmBooking({
      bookingId: booking.bookingId,
      paymentReference: "MOCK-PAYMENT-SUCCESS",
    });

    const ticket = ticketService.getTicket(confirmation.booking.bookingId);
    const pdf = ticketService.downloadTicketPdf(confirmation.booking.bookingId);
    const email = await ticketService.emailTicket({ bookingId: confirmation.booking.bookingId });

    expect(ticket.ticketId).toBeTruthy();
    expect(ticket.ticketNumber).toBeTruthy();
    expect(ticket.busNumber).toMatch(/^KA-/);
    expect(ticket.qrCode.payload.passengerCount).toBe(1);
    expect(pdf.mimeType).toBe("application/pdf");
    expect(pdf.downloadStatus).toBe("DOWNLOADED");
    expect(pdf.base64.length).toBeGreaterThan(100);
    expect(email.status).toBe("SENT");
  });
});

function tomorrowIsoDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);

  return date.toISOString().slice(0, 10);
}
