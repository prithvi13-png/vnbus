import { Injectable } from "@nestjs/common";
import type {
  AdminBookingListResponse,
  AdminBookingRecord,
  AdminDashboardResponse,
  AdminEmailTemplatePreviewResponse,
  AdminEmailTemplateRecord,
  AdminQueueStatusRecord,
  TicketEmailResponse,
} from "@vnbus/types";

import { EmailLoggerService } from "../../../shared/email/email-logger.service";
import type { JwtPrincipal } from "../../../shared/security/interfaces/jwt-principal.interface";
import { BookingService } from "../../booking/services/booking.service";
import { HealthService } from "../../health/services/health.service";
import { NotificationService } from "../../notification/services/notification.service";
import { TicketService } from "../../ticket/services/ticket.service";
import { AdminSummaryDto } from "../dto/admin-summary.dto";
import type { AdminBookingQueryDto } from "../dto/admin-booking-query.dto";
import type {
  AdminEmailTemplatePreviewDto,
  UpdateAdminEmailTemplateDto,
} from "../dto/admin-email-template.dto";
import type { AdminModulePort } from "../interfaces/admin.interface";
import { AdminRepository } from "../repositories/admin.repository";
import { AdminModuleValidator } from "../validators/admin.validator";

@Injectable()
export class AdminService implements AdminModulePort {
  constructor(
    private readonly repository: AdminRepository,
    private readonly validator: AdminModuleValidator,
    private readonly bookingService: BookingService,
    private readonly ticketService: TicketService,
    private readonly healthService: HealthService,
    private readonly notificationService: NotificationService,
    private readonly emailLogger: EmailLoggerService,
  ) {}

  getSummary(): AdminSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new AdminSummaryDto(summary);
  }

  async getDashboard(): Promise<AdminDashboardResponse> {
    return this.repository.getDashboard({
      bookings: await this.bookingService.listAllBookings(),
      health: this.healthService.getHealth(),
      emailQueue: this.emailQueueStatus(),
      notificationQueue: this.notificationService.getAdminCenter().queue,
    });
  }

  async listBookings(query: AdminBookingQueryDto): Promise<AdminBookingListResponse> {
    return this.repository.listBookings(await this.bookingService.listAllBookings(), query);
  }

  async getBooking(bookingId: string): Promise<AdminBookingRecord> {
    const booking = this.repository.findBooking(
      await this.bookingService.listAllBookings(),
      bookingId,
    );
    this.validator.ensureFound(booking, "Booking");

    return booking;
  }

  async resendBookingEmail(
    bookingId: string,
    principal: JwtPrincipal,
  ): Promise<TicketEmailResponse> {
    const booking = await this.getBooking(bookingId);

    return this.ticketService.emailTicket({ bookingId: booking.booking.bookingId }, principal);
  }

  listEmailTemplates(): AdminEmailTemplateRecord[] {
    return this.repository.listEmailTemplates();
  }

  updateEmailTemplate(
    key: string,
    dto: UpdateAdminEmailTemplateDto,
    principal: JwtPrincipal,
  ): AdminEmailTemplateRecord {
    const updated = this.repository.updateEmailTemplate(key, dto, principal.email);
    this.validator.ensureFound(updated, "Email template");

    return updated;
  }

  previewEmailTemplate(
    key: string,
    dto: AdminEmailTemplatePreviewDto,
  ): AdminEmailTemplatePreviewResponse {
    const preview = this.repository.previewEmailTemplate(key, dto.variables);
    this.validator.ensureFound(preview, "Email template");

    return preview;
  }

  /** Counted from the email log, which records every message the app sends. */
  private emailQueueStatus(): AdminQueueStatusRecord {
    const logs = this.emailLogger.list();

    return {
      name: "Email Queue",
      queued: logs.filter((log) => log.status === "QUEUED").length,
      sent: logs.filter((log) => log.status === "SENT").length,
      failed: logs.filter((log) => log.status === "FAILED").length,
      retryScheduled: logs.filter((log) => log.status === "RETRY_SCHEDULED").length,
    };
  }
}
