import { Injectable } from "@nestjs/common";
import { confirmMockBooking, createMockBooking, prepareMockBookingEmail } from "@vnbus/shared";
import type {
  BookingConfirmationResponse,
  BookingHistoryResponse,
  BookingRecord,
  CancelBookingResponse,
  RescheduleBookingResponse,
} from "@vnbus/types";

import { EmailQueueService } from "../../../shared/email/email-queue.service";
import { NotificationService } from "../../notification/services/notification.service";
import { SeatService } from "../../seat/services/seat.service";
import { TimelineService } from "../../timeline/services/timeline.service";
import { BookingSummaryDto } from "../dto/booking-summary.dto";
import type {
  CancelBookingDto,
  ConfirmBookingDto,
  CreateBookingDto,
  RescheduleBookingDto,
} from "../dto/booking-workflow.dto";
import type { BookingModulePort } from "../interfaces/booking.interface";
import { BookingRepository } from "../repositories/booking.repository";
import { BookingModuleValidator } from "../validators/booking.validator";

@Injectable()
export class BookingService implements BookingModulePort {
  constructor(
    private readonly repository: BookingRepository,
    private readonly validator: BookingModuleValidator,
    private readonly seatService: SeatService,
    private readonly emailService: EmailQueueService,
    private readonly timelineService: TimelineService,
    private readonly notificationService: NotificationService,
  ) {}

  getSummary(): BookingSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new BookingSummaryDto(summary);
  }

  listBookings(): BookingRecord[] {
    return this.repository.listBookings();
  }

  getHistory(): BookingHistoryResponse {
    const bookings = this.repository.listBookings();

    return {
      bookings,
      timeline: bookings.flatMap((booking) =>
        this.timelineService.listForBooking(booking.bookingId),
      ),
    };
  }

  listUpcoming(): BookingRecord[] {
    const now = Date.now();

    return this.repository
      .listBookings()
      .filter(
        (booking) =>
          Date.parse(booking.trip.departureTime) >= now &&
          !["CANCELLED", "EXPIRED", "FAILED"].includes(booking.status),
      );
  }

  listPast(): BookingRecord[] {
    const now = Date.now();

    return this.repository
      .listBookings()
      .filter((booking) => Date.parse(booking.trip.departureTime) < now);
  }

  listCancelled(): BookingRecord[] {
    return this.repository
      .listBookings()
      .filter((booking) => booking.status === "CANCELLED" || booking.status === "REFUND_PENDING");
  }

  getBooking(bookingId: string): BookingRecord | null {
    return this.repository.findBooking(bookingId);
  }

  upsertBooking(booking: BookingRecord): BookingRecord {
    return this.repository.saveBooking(booking);
  }

  async createBooking(dto: CreateBookingDto): Promise<BookingRecord> {
    const hold = this.seatService.getHold(dto.reservationId);
    this.validator.ensureCreateRequest(dto, hold);
    const layout = await this.seatService.getSeatLayout(dto.tripId, dto.journeyDate);
    const booking = createMockBooking(dto, layout, hold);
    const saved = this.repository.saveBooking(booking);

    this.timelineService.append({
      bookingId: saved.bookingId,
      type: "BOOKING_CREATED",
      title: "Booking created",
      description: "Booking created from selected seats.",
      occurredAt: saved.createdAt,
      tone: "info",
    });
    this.timelineService.append({
      bookingId: saved.bookingId,
      type: "SEAT_RESERVED",
      title: "Seat reserved",
      description: `Seats ${saved.selectedSeats.join(", ")} reserved for payment.`,
      occurredAt: saved.createdAt,
      tone: "success",
    });
    this.timelineService.append({
      bookingId: saved.bookingId,
      type: "PAYMENT_PENDING",
      title: "Payment pending",
      description: "Mock payment confirmation is pending.",
      occurredAt: saved.createdAt,
      tone: "warning",
    });

    return saved;
  }

  async confirmBooking(dto: ConfirmBookingDto): Promise<BookingConfirmationResponse> {
    const booking = this.repository.findBooking(dto.bookingId);
    this.validator.ensureConfirmRequest(dto, booking);
    const confirmation = confirmMockBooking(dto, booking);
    const email = prepareMockBookingEmail(confirmation.booking);

    this.repository.saveBooking(confirmation.booking);
    this.timelineService.append({
      bookingId: confirmation.booking.bookingId,
      type: "PAYMENT_CONFIRMED",
      title: "Payment confirmed",
      description: `Payment reference ${dto.paymentReference} accepted by the mock payment step.`,
      occurredAt: confirmation.booking.confirmedAt ?? confirmation.ticket.issuedAt,
      tone: "success",
    });
    this.timelineService.append({
      bookingId: confirmation.booking.bookingId,
      type: "TICKET_GENERATED",
      title: "Ticket generated",
      description: `Ticket ${confirmation.ticket.ticketNumber} generated from the internal ticket model.`,
      occurredAt: confirmation.ticket.issuedAt,
      tone: "success",
    });
    const emailLog = await this.emailService.queue({
      to: email.to,
      templateKey: "booking-confirmation",
      variables: {
        bookingReference: confirmation.booking.bookingReference,
        route: `${confirmation.booking.trip.sourceCity} to ${confirmation.booking.trip.destinationCity}`,
        attachmentFileName: email.attachmentFileName,
      },
    });
    this.timelineService.append({
      bookingId: confirmation.booking.bookingId,
      type: "EMAIL_SENT",
      title: "Email sent",
      description: `Booking confirmation queued and marked sent by mock email log ${emailLog.id}.`,
      occurredAt: emailLog.sentAt ?? emailLog.queuedAt,
      tone: "info",
    });
    this.notificationService.create({
      type: "BOOKING_UPDATE",
      title: "Ticket generated",
      body: `Ticket ${confirmation.ticket.ticketNumber} is ready for ${confirmation.booking.bookingReference}.`,
      bookingId: confirmation.booking.bookingId,
      emailLogId: emailLog.id,
    });

    return confirmation;
  }

  async cancelBooking(dto: CancelBookingDto): Promise<CancelBookingResponse> {
    const booking = this.repository.findBooking(dto.bookingId);
    this.validator.ensureCancellable(booking);
    const requestedAt = new Date().toISOString();
    const cancelledBooking: BookingRecord = {
      ...booking,
      status: "CANCELLED",
      cancelledAt: requestedAt,
    };

    this.repository.saveBooking(cancelledBooking);
    this.timelineService.append({
      bookingId: cancelledBooking.bookingId,
      type: "CANCELLATION_REQUESTED",
      title: "Cancellation requested",
      description: dto.reason?.trim() || "Cancellation requested from booking details.",
      occurredAt: requestedAt,
      tone: "warning",
    });
    this.timelineService.append({
      bookingId: cancelledBooking.bookingId,
      type: "CANCELLED",
      title: "Booking cancelled",
      description: "Mock cancellation completed.",
      occurredAt: requestedAt,
      tone: "danger",
    });
    this.timelineService.append({
      bookingId: cancelledBooking.bookingId,
      type: "REFUND_PENDING",
      title: "Refund pending",
      description: "Refund handoff remains a placeholder in Milestone 6.",
      occurredAt: requestedAt,
      tone: "warning",
    });
    const emailLog = await this.emailService.queue({
      to: cancelledBooking.passengers[0]?.email ?? "traveller@example.com",
      templateKey: "booking-cancelled",
      variables: {
        bookingReference: cancelledBooking.bookingReference,
        refundStatus: "Refund Pending",
      },
    });
    this.notificationService.create({
      type: "CANCELLATION_UPDATE",
      title: "Booking cancelled",
      body: `${cancelledBooking.bookingReference} was cancelled. Refund status is pending.`,
      bookingId: cancelledBooking.bookingId,
      emailLogId: emailLog.id,
    });

    return {
      booking: cancelledBooking,
      timeline: this.timelineService.listForBooking(cancelledBooking.bookingId),
      refundStatus: "REFUND_PENDING",
    };
  }

  async rescheduleBooking(dto: RescheduleBookingDto): Promise<RescheduleBookingResponse> {
    const booking = this.repository.findBooking(dto.bookingId);
    this.validator.ensureReschedulable(dto, booking);
    const rescheduledAt = new Date().toISOString();
    const updatedTrip = {
      ...booking.trip,
      tripId: dto.newTripId ?? booking.trip.tripId,
      departureTime: replaceIsoDate(booking.trip.departureTime, dto.newJourneyDate),
      arrivalTime: replaceIsoDate(booking.trip.arrivalTime, dto.newJourneyDate),
    };
    const rescheduledBooking: BookingRecord = {
      ...booking,
      status: "RESCHEDULED",
      trip: updatedTrip,
      rescheduledAt,
      newJourneyDate: dto.newJourneyDate,
    };

    this.repository.saveBooking(rescheduledBooking);
    this.timelineService.append({
      bookingId: rescheduledBooking.bookingId,
      type: "RESCHEDULE_REQUESTED",
      title: "Reschedule requested",
      description: "Customer selected a new journey date using the mock reschedule flow.",
      occurredAt: rescheduledAt,
      tone: "info",
    });
    this.timelineService.append({
      bookingId: rescheduledBooking.bookingId,
      type: "RESCHEDULED",
      title: "Booking rescheduled",
      description: `Journey moved to ${dto.newJourneyDate}.`,
      occurredAt: rescheduledAt,
      tone: "success",
    });
    const emailLog = await this.emailService.queue({
      to: rescheduledBooking.passengers[0]?.email ?? "traveller@example.com",
      templateKey: "booking-rescheduled",
      variables: {
        bookingReference: rescheduledBooking.bookingReference,
        journeyDate: dto.newJourneyDate,
      },
    });
    this.notificationService.create({
      type: "RESCHEDULE_UPDATE",
      title: "Booking rescheduled",
      body: `${rescheduledBooking.bookingReference} moved to ${dto.newJourneyDate}.`,
      bookingId: rescheduledBooking.bookingId,
      emailLogId: emailLog.id,
    });

    return {
      booking: rescheduledBooking,
      timeline: this.timelineService.listForBooking(rescheduledBooking.bookingId),
      status: "RESCHEDULED",
    };
  }
}

function replaceIsoDate(value: string, newDate: string): string {
  const time = value.includes("T") ? value.slice(10) : "T00:00:00.000Z";

  return `${newDate}${time}`;
}
