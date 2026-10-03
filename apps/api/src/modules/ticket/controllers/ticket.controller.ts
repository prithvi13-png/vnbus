import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { TicketEmailResponse, TicketPdfResponse, TicketRecord } from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import type { AuthenticatedRequest } from "../../../shared/security/interfaces/authenticated-request.interface";
import { requirePrincipal } from "../../../shared/security/require-user";
import { TicketSummaryDto } from "../dto/ticket-summary.dto";
import { TicketEmailDto } from "../dto/ticket-workflow.dto";
import { TicketService } from "../services/ticket.service";

@ApiTags("Ticket")
@ApiBearerAuth()
@Controller()
export class TicketController {
  constructor(private readonly service: TicketService) {}

  @Public()
  @Get("ticket/health")
  getHealth(): TicketSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("ticket/capabilities")
  getCapabilities(): TicketSummaryDto {
    return this.service.getSummary();
  }

  // A ticket names its passengers and their phone numbers, so each route
  // checks that the booking belongs to the signed-in user.
  @Get("tickets/:id")
  @ApiOkResponse({ description: "Ticket for a confirmed booking, by booking id" })
  getTicket(@Param("id") id: string, @Req() request: AuthenticatedRequest): Promise<TicketRecord> {
    return this.service.getTicket(id, requirePrincipal(request));
  }

  @Get("tickets/:id/pdf")
  @ApiOkResponse({ description: "Base64 encoded PDF ticket" })
  downloadTicketPdf(
    @Param("id") id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<TicketPdfResponse> {
    return this.service.downloadTicketPdf(id, requirePrincipal(request));
  }

  @Get("tickets/:id/download")
  @ApiOkResponse({ description: "Legacy base64 encoded PDF ticket route" })
  downloadTicket(
    @Param("id") id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<TicketPdfResponse> {
    return this.service.downloadTicketPdf(id, requirePrincipal(request));
  }

  @Post("tickets/email")
  @ApiOkResponse({ description: "Email the ticket" })
  emailTicket(
    @Body() dto: TicketEmailDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<TicketEmailResponse> {
    return this.service.emailTicket(dto, requirePrincipal(request));
  }
}
