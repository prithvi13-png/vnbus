import { EmailLoggerService } from "../../../shared/email/email-logger.service";
import { EmailQueueService } from "../../../shared/email/email-queue.service";
import { EmailRetryStrategy } from "../../../shared/email/email-retry.strategy";
import { EmailTemplateService } from "../../../shared/email/email-template.service";
import { BookingRepository } from "../../booking/repositories/booking.repository";
import { BookingService } from "../../booking/services/booking.service";
import { BookingModuleValidator } from "../../booking/validators/booking.validator";
import { DistributedLockService } from "../../integration/services/distributed-lock.service";
import { IdempotencyService } from "../../integration/services/idempotency.service";
import { IntegrationConfigurationService } from "../../integration/services/integration-configuration.service";
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
import { PaymentRepository } from "../repositories/payment.repository";
import { PaymentService } from "../services/payment.service";

describe("Mock supplier and payment E2E flow", () => {
  it("searches, holds seats, creates booking, captures mock payment, and confirms ticket", async () => {
    const idempotency = new IdempotencyService();
    const seatService = new SeatService(
      new SeatRepository(),
      new SeatModuleValidator(),
      createTestSupplierManager(),
      idempotency,
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
    const paymentService = new PaymentService(
      new PaymentRepository(),
      new IntegrationConfigurationService(),
      idempotency,
    );
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
          phone: "+919999999999",
          email: "aarav@example.com",
        },
      ],
    });
    const intent = await paymentService.createIntent({
      bookingId: booking.bookingId,
      amount: booking.fare.grandTotal,
      idempotencyKey: `intent:${booking.bookingId}`,
    });
    const payment = await paymentService.capturePayment({
      paymentIntentId: intent.paymentIntentId,
      idempotencyKey: `capture:${intent.paymentIntentId}`,
    });
    const confirmation = await bookingService.confirmBooking({
      bookingId: booking.bookingId,
      paymentReference: payment.transactionId,
    });

    expect(confirmation.booking.status).toBe("TICKET_GENERATED");
    expect(confirmation.ticket.ticketNumber).toMatch(/^VNT-/u);
    expect(notificationService.getNotificationCenter().unread[0]?.title).toBe("Ticket generated");
  });
});

function tomorrowIsoDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);

  return date.toISOString().slice(0, 10);
}
