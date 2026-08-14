import { Injectable, Optional } from "@nestjs/common";
import type {
  AdminBookingListResponse,
  AdminDashboardResponse,
  AdminEmailTemplatePreviewResponse,
  AdminEmailTemplateRecord,
  TicketEmailResponse,
} from "@vnbus/types";

import { BookingService } from "../../booking/services/booking.service";
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
    @Optional() private readonly bookingService?: BookingService,
    @Optional() private readonly ticketService?: TicketService,
  ) {}

  getSummary(): AdminSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new AdminSummaryDto(summary);
  }

  getDashboard(): AdminDashboardResponse {
    return this.repository.getDashboard(this.bookingService?.listBookings());
  }

  listBookings(query: AdminBookingQueryDto): AdminBookingListResponse {
    return this.repository.listBookings(this.bookingService?.listBookings(), query);
  }

  getBooking(bookingId: string) {
    const booking = this.repository.getBooking(this.bookingService?.listBookings(), bookingId);
    this.validator.ensureFound(booking, "Booking");

    return booking;
  }

  async resendBookingEmail(bookingId: string): Promise<TicketEmailResponse> {
    const booking = this.repository.getBooking(this.bookingService?.listBookings(), bookingId);
    if (!booking) {
      return this.repository.resendBookingEmail(bookingId);
    }

    return (
      (await this.ticketService?.emailTicket({ bookingId: booking.booking.bookingId })) ??
      this.repository.resendBookingEmail(booking.booking.bookingId)
    );
  }

  listEmailTemplates(): AdminEmailTemplateRecord[] {
    return this.repository.listEmailTemplates();
  }

  updateEmailTemplate(key: string, dto: UpdateAdminEmailTemplateDto): AdminEmailTemplateRecord {
    const updated = this.repository.updateEmailTemplate(key, dto);
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
}
