import { Injectable } from "@nestjs/common";
import { createTicketPdf } from "@vnbus/shared";
import type { TicketEmailResponse, TicketPdfResponse, TicketRecord } from "@vnbus/types";

import { EmailQueueService } from "../../../shared/email/email-queue.service";
import { buildTicketEmail } from "../../../shared/email/ticket-email";
import type { JwtPrincipal } from "../../../shared/security/interfaces/jwt-principal.interface";
import { BookingService, SUPPORT_EMAIL } from "../../booking/services/booking.service";
import { NotificationService } from "../../notification/services/notification.service";
import { TimelineService } from "../../timeline/services/timeline.service";
import { TicketSummaryDto } from "../dto/ticket-summary.dto";
import type { TicketEmailDto } from "../dto/ticket-workflow.dto";
import type { TicketModulePort } from "../interfaces/ticket.interface";
import { TicketMapper } from "../mappers/ticket.mapper";
import { TicketRepository } from "../repositories/ticket.repository";
import { TicketModuleValidator } from "../validators/ticket.validator";

@Injectable()
export class TicketService implements TicketModulePort {
  constructor(
    private readonly repository: TicketRepository,
    private readonly validator: TicketModuleValidator,
    private readonly bookingService: BookingService,
    private readonly mapper: TicketMapper,
    private readonly emailService: EmailQueueService,
    private readonly timelineService: TimelineService,
    private readonly notificationService: NotificationService,
  ) {}

  getSummary(): TicketSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new TicketSummaryDto(summary);
  }

  /** The ticket for one of the user's bookings, looked up by booking id. */
  async getTicket(bookingId: string, principal: JwtPrincipal): Promise<TicketRecord> {
    const booking = await this.bookingService.getBookingForUser(bookingId, principal);
    this.validator.ensureTicketable(booking);

    return this.mapper.fromBooking(booking, this.repository.findActivity(booking.bookingId));
  }

  async downloadTicketPdf(bookingId: string, principal: JwtPrincipal): Promise<TicketPdfResponse> {
    const booking = await this.bookingService.getBookingForUser(bookingId, principal);
    this.validator.ensureTicketable(booking);
    const downloadedAt = new Date().toISOString();
    const pdf = createTicketPdf(booking, { supportEmail: SUPPORT_EMAIL });

    this.repository.recordActivity(booking.bookingId, { lastDownloadedAt: downloadedAt });
    await this.timelineService.append({
      bookingId: booking.bookingId,
      type: "TICKET_DOWNLOADED",
      title: "Ticket downloaded",
      description: `${pdf.fileName} downloaded.`,
      occurredAt: downloadedAt,
      tone: "info",
    });

    return { ...pdf, downloadStatus: "DOWNLOADED", downloadedAt };
  }

  async emailTicket(dto: TicketEmailDto, principal: JwtPrincipal): Promise<TicketEmailResponse> {
    const ticket = await this.getTicket(dto.bookingId, principal);
    const to = dto.to ?? ticket.passengers[0]?.email ?? "";
    const email = buildTicketEmail(ticket, SUPPORT_EMAIL);
    const emailLog = await this.emailService.queue({
      to,
      templateKey: "booking-confirmation",
      variables: {
        subject: email.subject,
        ticketHtml: email.ticketHtml,
        ticketText: email.ticketText,
      },
    });
    const emailedAt = emailLog.sentAt ?? emailLog.queuedAt;

    this.repository.recordActivity(ticket.bookingId, { lastEmailedAt: emailedAt });
    await this.timelineService.append({
      bookingId: ticket.bookingId,
      type: "EMAIL_SENT",
      title: "Ticket emailed",
      description: `Ticket email to ${emailLog.to}: ${emailLog.status.toLowerCase()}.`,
      occurredAt: emailedAt,
      tone: "info",
    });
    this.notificationService.create({
      userId: principal.sub,
      type: "EMAIL_HISTORY",
      title: "Ticket email sent",
      body: `Ticket ${ticket.ticketNumber} was emailed to ${emailLog.to}.`,
      bookingId: ticket.bookingId,
      emailLogId: emailLog.id,
    });

    return {
      bookingId: ticket.bookingId,
      ticketId: ticket.ticketId,
      queued: true,
      emailLogId: emailLog.id,
      status: emailLog.status,
    };
  }
}
