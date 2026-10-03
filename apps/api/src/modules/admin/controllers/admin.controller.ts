import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type {
  AdminBookingListResponse,
  AdminBookingRecord,
  AdminDashboardResponse,
  AdminEmailTemplatePreviewResponse,
  AdminEmailTemplateRecord,
  TicketEmailResponse,
} from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import type { AuthenticatedRequest } from "../../../shared/security/interfaces/authenticated-request.interface";
import { requirePrincipal } from "../../../shared/security/require-user";
import { AdminBookingQueryDto } from "../dto/admin-booking-query.dto";
import {
  AdminEmailTemplatePreviewDto,
  UpdateAdminEmailTemplateDto,
} from "../dto/admin-email-template.dto";
import { AdminSummaryDto } from "../dto/admin-summary.dto";
import { AdminService } from "../services/admin.service";

@ApiTags("Admin")
@ApiBearerAuth()
@Controller("admin")
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Public()
  @Get("health")
  getHealth(): AdminSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("capabilities")
  getCapabilities(): AdminSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("dashboard")
  @ApiOkResponse({ description: "Enterprise admin dashboard control center" })
  getDashboard(): Promise<AdminDashboardResponse> {
    return this.service.getDashboard();
  }

  @Roles("ADMIN")
  @Get("bookings")
  @ApiOkResponse({ description: "Admin booking management list with advanced filters" })
  listBookings(@Query() query: AdminBookingQueryDto): Promise<AdminBookingListResponse> {
    return this.service.listBookings(query);
  }

  @Roles("ADMIN")
  @Get("bookings/:bookingId")
  @ApiOkResponse({ description: "Admin booking detail with ticket and timeline metadata" })
  getBooking(@Param("bookingId") bookingId: string): Promise<AdminBookingRecord> {
    return this.service.getBooking(bookingId);
  }

  @Roles("ADMIN")
  @Post("bookings/:bookingId/resend-email")
  @ApiOkResponse({ description: "Resend ticket email through the email queue" })
  resendEmail(
    @Param("bookingId") bookingId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<TicketEmailResponse> {
    return this.service.resendBookingEmail(bookingId, requirePrincipal(request));
  }

  @Roles("ADMIN")
  @Get("email-templates")
  @ApiOkResponse({ description: "Visual email template management records" })
  listEmailTemplates(): AdminEmailTemplateRecord[] {
    return this.service.listEmailTemplates();
  }

  @Roles("ADMIN")
  @Patch("email-templates/:key")
  @ApiOkResponse({ description: "Update an email template and append version history" })
  updateEmailTemplate(
    @Param("key") key: string,
    @Body() dto: UpdateAdminEmailTemplateDto,
    @Req() request: AuthenticatedRequest,
  ): AdminEmailTemplateRecord {
    return this.service.updateEmailTemplate(key, dto, requirePrincipal(request));
  }

  @Roles("ADMIN")
  @Post("email-templates/:key/preview")
  @ApiOkResponse({ description: "Render a template preview with sample variables" })
  previewEmailTemplate(
    @Param("key") key: string,
    @Body() dto: AdminEmailTemplatePreviewDto,
  ): AdminEmailTemplatePreviewResponse {
    return this.service.previewEmailTemplate(key, dto);
  }
}
