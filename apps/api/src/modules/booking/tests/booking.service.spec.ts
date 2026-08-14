import { EmailLoggerService } from "../../../shared/email/email-logger.service";
import { EmailQueueService } from "../../../shared/email/email-queue.service";
import { EmailRetryStrategy } from "../../../shared/email/email-retry.strategy";
import { EmailTemplateService } from "../../../shared/email/email-template.service";
import type { BookingRecord } from "@vnbus/types";
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
import { BookingRepository } from "../repositories/booking.repository";
import { BookingService } from "../services/booking.service";
import { BookingModuleValidator } from "../validators/booking.validator";

describe("BookingService", () => {
  const createServices = (): { bookingService: BookingService; seatService: SeatService } => {
    const seatService = new SeatService(
      new SeatRepository(),
      new SeatModuleValidator(),
      createTestSupplierManager(),
      new IdempotencyService(),
      new DistributedLockService(),
    );
    const timelineService = new TimelineService(
      new TimelineRepository(),
      new TimelineModuleValidator(),
    );
    const notificationService = new NotificationService(
      new NotificationRepository(),
      new NotificationModuleValidator(),
    );
    const emailService = new EmailQueueService(
      new EmailTemplateService(),
      new EmailLoggerService(),
      new EmailRetryStrategy(),
    );
    const bookingService = new BookingService(
      new BookingRepository(),
      new BookingModuleValidator(),
      seatService,
      emailService,
      timelineService,
      notificationService,
    );

    return { bookingService, seatService };
  };

  it("returns module readiness and capabilities", () => {
    const { bookingService } = createServices();
    const summary = bookingService.getSummary();

    expect(summary.module).toBe("booking");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("creates and confirms a booking from a held seat", async () => {
    const { bookingService, seatService } = createServices();
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
          firstName: "Aarav",
          lastName: "Sharma",
          age: 32,
          gender: "MALE",
          phone: "+919876543210",
          email: "traveller@example.com",
        },
      ],
    });

    expect(booking.status).toBe("PENDING_PAYMENT");

    const confirmation = await bookingService.confirmBooking({
      bookingId: booking.bookingId,
      paymentReference: "MOCK-PAYMENT-SUCCESS",
    });

    expect(confirmation.booking.status).toBe("TICKET_GENERATED");
    expect(confirmation.ticket.pnr).toBeTruthy();
    expect(bookingService.getHistory().timeline.map((event) => event.type)).toEqual([
      "BOOKING_CREATED",
      "SEAT_RESERVED",
      "PAYMENT_PENDING",
      "PAYMENT_CONFIRMED",
      "TICKET_GENERATED",
      "EMAIL_SENT",
    ]);
  });

  it("cancels and reschedules active bookings through mock lifecycle events", async () => {
    const { bookingService, seatService } = createServices();
    const booking = await createConfirmedBooking(bookingService, seatService);

    const rescheduled = await bookingService.rescheduleBooking({
      bookingId: booking.bookingId,
      newJourneyDate: futureIsoDate(5),
    });
    const cancelled = await bookingService.cancelBooking({
      bookingId: booking.bookingId,
      reason: "Plans changed",
    });

    expect(rescheduled.status).toBe("RESCHEDULED");
    expect(cancelled.booking.status).toBe("CANCELLED");
    expect(bookingService.listCancelled()).toHaveLength(1);
  });
});

function tomorrowIsoDate(): string {
  return futureIsoDate(1);
}

function futureIsoDate(daysAhead: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysAhead);

  return date.toISOString().slice(0, 10);
}

async function createConfirmedBooking(
  bookingService: BookingService,
  seatService: SeatService,
): Promise<BookingRecord> {
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
        firstName: "Aarav",
        lastName: "Sharma",
        age: 32,
        gender: "MALE",
        phone: "+919876543210",
        email: "traveller@example.com",
      },
    ],
  });
  const confirmation = await bookingService.confirmBooking({
    bookingId: booking.bookingId,
    paymentReference: "MOCK-PAYMENT-SUCCESS",
  });

  return confirmation.booking;
}
