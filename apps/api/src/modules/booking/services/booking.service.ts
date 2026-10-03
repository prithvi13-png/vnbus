import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { SupplierBlockPassenger } from "@vnbus/supplier-sdk";
import { createTicketRecord, summarizeSeatFare } from "@vnbus/shared";
import type {
  BoardingDroppingPoint,
  BookingConfirmationResponse,
  BookingFareSummary,
  BookingHistoryResponse,
  BookingPassengerInput,
  BookingRecord,
  BookingTimelineEvent,
  BusPoint,
  CancelBookingResponse,
  Money,
  SupplierCode,
} from "@vnbus/types";

import { EmailQueueService } from "../../../shared/email/email-queue.service";
import { buildTicketEmail } from "../../../shared/email/ticket-email";
import type { JwtPrincipal } from "../../../shared/security/interfaces/jwt-principal.interface";
import { isAdmin } from "../../../shared/security/require-user";
import { SupplierManagerService } from "../../integration/services/supplier-manager.service";
import { toSupplierHttpException } from "../../integration/supplier-http-errors";
import { NotificationService } from "../../notification/services/notification.service";
import { SeatService } from "../../seat/services/seat.service";
import { TimelineService } from "../../timeline/services/timeline.service";
import { BookingSummaryDto } from "../dto/booking-summary.dto";
import type { CancelBookingDto, CreateBookingDto } from "../dto/booking-workflow.dto";
import type { BookingModulePort } from "../interfaces/booking.interface";
import { BookingRepository } from "../repositories/booking.repository";
import { BookingModuleValidator } from "../validators/booking.validator";

/** Shown on the ticket as the address to quote a PNR to. */
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "info@vriddhinexus.com";

/** Who a booking is being made for, beyond the signed-in user making it. */
export interface BookingAttribution {
  channel: "CUSTOMER" | "AGENT";
  agentId?: string | null;
  customerId?: string | null;
}

@Injectable()
export class BookingService implements BookingModulePort {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly repository: BookingRepository,
    private readonly validator: BookingModuleValidator,
    private readonly seatService: SeatService,
    private readonly supplierManager: SupplierManagerService,
    private readonly emailService: EmailQueueService,
    private readonly timelineService: TimelineService,
    private readonly notificationService: NotificationService,
  ) {}

  getSummary(): BookingSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new BookingSummaryDto(summary);
  }

  /** Every booking on the platform. For admin and reporting views only. */
  listAllBookings(): Promise<BookingRecord[]> {
    return this.repository.listAll();
  }

  listBookings(principal: JwtPrincipal): Promise<BookingRecord[]> {
    return this.repository.listForUser(principal.sub);
  }

  async getHistory(principal: JwtPrincipal): Promise<BookingHistoryResponse> {
    const bookings = await this.listBookings(principal);

    return {
      bookings,
      timeline: await this.timelineService.listForBookings(
        bookings.map((booking) => booking.bookingId),
      ),
    };
  }

  async listUpcoming(principal: JwtPrincipal): Promise<BookingRecord[]> {
    const now = Date.now();

    return (await this.listBookings(principal)).filter(
      (booking) =>
        Date.parse(booking.trip.departureTime) >= now &&
        !["CANCELLED", "EXPIRED", "FAILED"].includes(booking.status),
    );
  }

  async listPast(principal: JwtPrincipal): Promise<BookingRecord[]> {
    const now = Date.now();

    return (await this.listBookings(principal)).filter(
      (booking) => Date.parse(booking.trip.departureTime) < now,
    );
  }

  async listCancelled(principal: JwtPrincipal): Promise<BookingRecord[]> {
    return (await this.listBookings(principal)).filter((booking) =>
      ["CANCELLATION_REQUESTED", "CANCELLED", "REFUND_PENDING"].includes(booking.status),
    );
  }

  /**
   * A booking the signed-in user may see: their own, or any for an admin.
   * Someone else's booking answers exactly like a missing one, so booking ids
   * cannot be probed.
   */
  async getBookingForUser(bookingId: string, principal: JwtPrincipal): Promise<BookingRecord> {
    const booking = await this.repository.findById(bookingId);

    if (!booking || !(isAdmin(principal) || (await this.isOwner(bookingId, principal)))) {
      throw new NotFoundException("Booking not found");
    }

    return booking;
  }

  async getTimeline(bookingId: string, principal: JwtPrincipal): Promise<BookingTimelineEvent[]> {
    await this.getBookingForUser(bookingId, principal);

    return this.timelineService.listForBookings([bookingId]);
  }

  /**
   * Books seats with the supplier and issues the ticket.
   *
   * The supplier sells in two steps: Block holds the seats against the
   * passengers, Book sells them. The booking is saved between the two, so a
   * failed Book leaves a FAILED record behind rather than nothing, and a
   * successful one is never sold without a row to attach it to.
   *
   * No payment is taken: no payment gateway is wired yet, and the supplier
   * charges the platform's own account for each ticket.
   */
  async createBooking(
    dto: CreateBookingDto,
    principal: JwtPrincipal,
    attribution: BookingAttribution = { channel: "CUSTOMER" },
  ): Promise<BookingConfirmationResponse> {
    this.validator.ensureCreateRequest(dto);
    const trip = this.seatService.getSearchedTrip(dto.tripId);
    const supplierCode = trip.supplierCode as SupplierCode;
    const boardingPoint = findPoint(trip.boardingPoints, dto.boardingPointId, "boarding");
    const droppingPoint = findPoint(trip.droppingPoints, dto.droppingPointId, "dropping");
    const layout = await this.seatService.getSeatLayout(dto.tripId, dto.journeyDate);
    const seats = this.validator.ensureSeatsBookable(dto, layout);
    const passengers = orderPassengersBySeat(dto.passengers, dto.selectedSeats);
    const leadPassenger = passengers[0];

    if (!leadPassenger) {
      throw new NotFoundException("No passengers to book");
    }

    let block;
    try {
      block = await this.supplierManager.blockSeats({
        supplierCode,
        tripId: dto.tripId,
        boardingPointId: boardingPoint.id,
        droppingPointId: droppingPoint.id,
        contactEmail: leadPassenger.email,
        contactPhone: leadPassenger.phone,
        passengers: passengers.map(toBlockPassenger),
      });
    } catch (error) {
      throw toSupplierHttpException(error);
    }

    const fare = reconcileFare(summarizeSeatFare(seats), block.fare);
    const pending = await this.repository.create({
      userId: principal.sub,
      channel: attribution.channel,
      agentId: attribution.agentId ?? null,
      customerId: attribution.customerId ?? null,
      supplierCode,
      supplierBlockId: block.blockId,
      status: "SEAT_HELD",
      journeyDate: dto.journeyDate,
      trip,
      boardingPoint,
      droppingPoint,
      passengers,
      fare,
    });

    await this.timelineService.append({
      bookingId: pending.bookingId,
      type: "SEAT_RESERVED",
      title: "Seats reserved",
      description: `${trip.operatorName} is holding seats ${pending.selectedSeats.join(", ")}.`,
      occurredAt: pending.createdAt,
      tone: "info",
    });

    let sale;
    try {
      sale = await this.supplierManager.confirmBooking(supplierCode, {
        supplierCode,
        blockId: block.blockId,
        tripId: dto.tripId,
        paymentReference: "",
      });
    } catch (error) {
      await this.repository.update(pending.bookingId, { status: "FAILED" });
      throw toSupplierHttpException(error);
    }

    const confirmedAt = new Date().toISOString();
    const booking = await this.recordSale(pending, {
      status: "TICKET_GENERATED",
      supplierBookingId: sale.supplierBookingId || null,
      pnr: sale.pnr || null,
      ticketNumber: sale.ticketNumber || null,
      confirmedAt,
    });
    const ticket = createTicketRecord(booking, { supportEmail: SUPPORT_EMAIL });

    await this.timelineService.append({
      bookingId: booking.bookingId,
      type: "TICKET_GENERATED",
      title: "Ticket issued",
      description: `${trip.operatorName} issued ticket ${ticket.ticketNumber} (PNR ${ticket.pnr}).`,
      occurredAt: confirmedAt,
      tone: "success",
    });
    await this.sendTicketEmail(booking, principal.sub);

    return { booking, ticket };
  }

  /**
   * Asks the supplier to cancel every seat on the booking. The supplier
   * accepts a cancellation before it settles it, so the booking moves to
   * CANCELLATION_REQUESTED with the refund pending — never straight to a
   * refunded state the supplier has not reached.
   */
  async cancelBooking(
    dto: CancelBookingDto,
    principal: JwtPrincipal,
  ): Promise<CancelBookingResponse> {
    const booking = await this.getBookingForUser(dto.bookingId, principal);
    this.validator.ensureCancellable(booking);
    const supplierCode = booking.supplierCode as SupplierCode;
    const reason = dto.reason?.trim() || "Cancelled by the traveller";
    const accepted: string[] = [];
    const refused: string[] = [];
    let lastError: unknown;

    for (const seatName of booking.selectedSeats) {
      try {
        const cancellation = await this.supplierManager.cancelBooking(supplierCode, {
          supplierCode,
          bookingId: booking.bookingId,
          supplierBookingId: booking.supplierBookingId ?? "",
          tripId: booking.trip.tripId,
          seatName,
          reason,
        });

        (cancellation.status === "FAILED" ? refused : accepted).push(seatName);
      } catch (error) {
        lastError = error;
        refused.push(seatName);
      }
    }

    if (accepted.length === 0) {
      throw lastError
        ? toSupplierHttpException(lastError)
        : new ConflictException(
            "The bus operator did not accept the cancellation. Contact support with your PNR.",
          );
    }

    const requestedAt = new Date().toISOString();
    const updated = await this.repository.update(booking.bookingId, {
      status: "CANCELLATION_REQUESTED",
      cancelledAt: requestedAt,
    });

    await this.timelineService.append({
      bookingId: booking.bookingId,
      type: "CANCELLATION_REQUESTED",
      title: "Cancellation requested",
      description:
        refused.length === 0
          ? `${reason}. The operator accepted the cancellation of seats ${accepted.join(", ")}.`
          : `${reason}. Accepted for seats ${accepted.join(", ")}; refused for ${refused.join(", ")} — contact support.`,
      occurredAt: requestedAt,
      tone: refused.length === 0 ? "warning" : "danger",
    });
    await this.timelineService.append({
      bookingId: booking.bookingId,
      type: "REFUND_PENDING",
      title: "Refund pending",
      description: "The refund follows once the operator settles the cancellation.",
      occurredAt: requestedAt,
      tone: "warning",
    });
    await this.notify(principal.sub, booking.passengers[0]?.email, {
      templateKey: "booking-cancelled",
      variables: { bookingReference: booking.bookingReference, refundStatus: "Refund pending" },
      notification: {
        type: "CANCELLATION_UPDATE",
        title: "Cancellation requested",
        body: `${booking.bookingReference}: the operator is processing your cancellation. Refund pending.`,
        bookingId: booking.bookingId,
      },
    });

    return {
      booking: updated,
      timeline: await this.timelineService.listForBookings([booking.bookingId]),
      refundStatus: "REFUND_PENDING",
    };
  }

  private async isOwner(bookingId: string, principal: JwtPrincipal): Promise<boolean> {
    return (await this.repository.findOwnerId(bookingId)) === principal.sub;
  }

  /**
   * Records what the supplier sold. By now the seat is sold and the traveller
   * holds a valid ticket, so a database failure here must not hide it from
   * them: the sale is logged in full for reconciliation and the booking is
   * still returned.
   */
  private async recordSale(
    pending: BookingRecord,
    sale: Pick<
      BookingRecord,
      "status" | "supplierBookingId" | "pnr" | "ticketNumber" | "confirmedAt"
    >,
  ): Promise<BookingRecord> {
    try {
      return await this.repository.update(pending.bookingId, sale);
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          event: "booking.sale_not_recorded",
          bookingId: pending.bookingId,
          bookingReference: pending.bookingReference,
          supplierCode: pending.supplierCode,
          ...sale,
          message: error instanceof Error ? error.message : String(error),
        }),
      );

      return { ...pending, ...sale };
    }
  }

  /** The ticket email and in-app notice. Neither is allowed to undo a sale. */
  private async sendTicketEmail(booking: BookingRecord, userId: string): Promise<void> {
    const ticket = createTicketRecord(booking, { supportEmail: SUPPORT_EMAIL });
    const email = buildTicketEmail(ticket, SUPPORT_EMAIL);

    await this.notify(userId, booking.passengers[0]?.email, {
      templateKey: "booking-confirmation",
      variables: {
        subject: email.subject,
        ticketHtml: email.ticketHtml,
        ticketText: email.ticketText,
      },
      notification: {
        type: "BOOKING_UPDATE",
        title: "Ticket generated",
        body: `Ticket ${ticket.ticketNumber} (PNR ${ticket.pnr}) is ready for ${booking.bookingReference}.`,
        bookingId: booking.bookingId,
      },
    });
    await this.repository.update(booking.bookingId, { emailPrepared: true }).catch(() => undefined);
  }

  private async notify(
    userId: string,
    to: string | undefined,
    message: {
      templateKey: "booking-confirmation" | "booking-cancelled";
      variables: Record<string, string>;
      notification: {
        type: "BOOKING_UPDATE" | "CANCELLATION_UPDATE";
        title: string;
        body: string;
        bookingId: string;
      };
    },
  ): Promise<void> {
    let emailLogId: string | undefined;

    if (to) {
      try {
        const log = await this.emailService.queue({
          to,
          templateKey: message.templateKey,
          variables: message.variables,
        });
        emailLogId = log.id;
        await this.timelineService.append({
          bookingId: message.notification.bookingId,
          type: "EMAIL_SENT",
          title: "Email sent",
          description: `${message.notification.title} email to ${to}: ${log.status.toLowerCase()}.`,
          occurredAt: log.sentAt ?? log.queuedAt,
          tone: "info",
        });
      } catch (error) {
        this.logger.warn(
          JSON.stringify({
            event: "booking.email_failed",
            bookingId: message.notification.bookingId,
            message: error instanceof Error ? error.message : String(error),
          }),
        );
      }
    }

    this.notificationService.create({
      userId,
      ...message.notification,
      ...(emailLogId ? { emailLogId } : {}),
    });
  }
}

function findPoint(
  points: BusPoint[],
  pointId: string,
  kind: "boarding" | "dropping",
): BoardingDroppingPoint {
  const point = points.find((candidate) => candidate.id === pointId);

  if (!point) {
    throw new NotFoundException(`That ${kind} point is not on this bus's route`);
  }

  return { ...point, landmark: "" };
}

/** Passengers in seat order, so the lead passenger is the first seat chosen. */
function orderPassengersBySeat(
  passengers: BookingPassengerInput[],
  seats: string[],
): BookingPassengerInput[] {
  return seats
    .map((seat) => passengers.find((passenger) => passenger.seatNumber === seat))
    .filter((passenger): passenger is BookingPassengerInput => Boolean(passenger));
}

/**
 * SRDV's Block requires a title. The form asks for gender, and SRDV documents
 * only male (1, "Mr"); female follows convention. "Other" has no SRDV code at
 * all and goes as the documented default rather than an undefined value.
 */
function toBlockPassenger(passenger: BookingPassengerInput, index: number): SupplierBlockPassenger {
  return {
    seatNumber: passenger.seatNumber,
    title: passenger.gender === "FEMALE" ? "Ms" : "Mr",
    firstName: passenger.firstName,
    lastName: passenger.lastName,
    gender: passenger.gender,
    age: passenger.age,
    email: passenger.email,
    phone: passenger.phone,
    isLeadPassenger: index === 0,
  };
}

/**
 * The seat map's prices are what the traveller saw; the block's total is what
 * the supplier will charge. When they differ the supplier's figure stands,
 * with the GST from the seat map kept and the base adjusted to match.
 */
function reconcileFare(fromSeats: BookingFareSummary, blocked: Money): BookingFareSummary {
  if (blocked.amount <= 0 || Math.abs(blocked.amount - fromSeats.grandTotal.amount) < 0.01) {
    return fromSeats;
  }

  return {
    ...fromSeats,
    baseFare: { ...fromSeats.baseFare, amount: blocked.amount - fromSeats.taxes.amount },
    grandTotal: { ...fromSeats.grandTotal, amount: blocked.amount },
  };
}
