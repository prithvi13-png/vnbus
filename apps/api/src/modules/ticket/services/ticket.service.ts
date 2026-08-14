import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { createMockTicketPdf } from "@vnbus/shared";
import type { TicketEmailResponse, TicketPdfResponse, TicketRecord } from "@vnbus/types";

import { EmailQueueService } from "../../../shared/email/email-queue.service";
import { BookingService } from "../../booking/services/booking.service";
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

  getTicket(id: string): TicketRecord {
    const existing = this.repository.findById(id);
    if (existing) {
      this.validator.ensureTicket(existing);

      return existing;
    }

    const booking = this.bookingService.getBooking(id);
    this.validator.ensureTicketable(booking);

    return this.repository.save(this.mapper.fromBooking(booking));
  }

  downloadTicketPdf(id: string): TicketPdfResponse {
    const ticket = this.getTicket(id);
    const booking = this.bookingService.getBooking(ticket.bookingId);
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    this.validator.ensureTicketable(booking);
    const downloadedAt = new Date().toISOString();
    const pdf = {
      ...createMockTicketPdf(booking),
      ticketId: ticket.ticketId,
      downloadStatus: "DOWNLOADED" as const,
      downloadedAt,
    };
    const updatedTicket: TicketRecord = {
      ...ticket,
      status: "DOWNLOADED",
      lastDownloadedAt: downloadedAt,
    };

    this.repository.save(updatedTicket);
    this.repository.recordDownload(ticket.ticketId, pdf);
    this.timelineService.append({
      bookingId: booking.bookingId,
      type: "TICKET_DOWNLOADED",
      title: "Ticket downloaded",
      description: `PDF ${pdf.fileName} downloaded from the mock ticket service.`,
      occurredAt: downloadedAt,
      tone: "info",
    });

    return pdf;
  }

  async emailTicket(dto: TicketEmailDto): Promise<TicketEmailResponse> {
    const ticket = this.getTicket(dto.bookingId);
    const booking = this.bookingService.getBooking(ticket.bookingId);
    if (!booking) {
      throw new BadRequestException("Booking not found for ticket");
    }
    const emailLog = await this.emailService.queue({
      to: dto.to ?? booking.passengers[0]?.email ?? "traveller@example.com",
      templateKey: "booking-confirmation",
      variables: {
        bookingReference: booking.bookingReference,
        route: `${booking.trip.sourceCity} to ${booking.trip.destinationCity}`,
        attachmentFileName: `${booking.bookingReference}.pdf`,
      },
    });
    const emailedAt = emailLog.sentAt ?? emailLog.queuedAt;
    this.repository.save({
      ...ticket,
      status: "EMAIL_SENT",
      lastEmailedAt: emailedAt,
    });
    this.timelineService.append({
      bookingId: booking.bookingId,
      type: "EMAIL_SENT",
      title: "Ticket emailed",
      description: `Ticket email sent using mock email log ${emailLog.id}.`,
      occurredAt: emailedAt,
      tone: "info",
    });
    this.notificationService.create({
      type: "EMAIL_HISTORY",
      title: "Ticket email sent",
      body: `Ticket ${ticket.ticketNumber} was emailed to ${emailLog.to}.`,
      bookingId: booking.bookingId,
      emailLogId: emailLog.id,
    });

    return {
      bookingId: booking.bookingId,
      ticketId: ticket.ticketId,
      queued: true,
      emailLogId: emailLog.id,
      status: emailLog.status,
    };
  }
}
