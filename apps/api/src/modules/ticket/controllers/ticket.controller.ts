import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { TicketEmailResponse, TicketPdfResponse, TicketRecord } from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
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

  @Public()
  @Get("tickets/:id")
  @ApiOkResponse({ description: "Confirmed ticket view by ticket id or booking id" })
  getTicket(@Param("id") id: string): TicketRecord {
    return this.service.getTicket(id);
  }

  @Public()
  @Get("tickets/:id/pdf")
  @ApiOkResponse({ description: "Base64 encoded mock PDF ticket" })
  downloadTicketPdf(@Param("id") id: string): TicketPdfResponse {
    return this.service.downloadTicketPdf(id);
  }

  @Public()
  @Get("tickets/:id/download")
  @ApiOkResponse({ description: "Legacy base64 encoded mock PDF ticket route" })
  downloadTicket(@Param("id") id: string): TicketPdfResponse {
    return this.service.downloadTicketPdf(id);
  }

  @Public()
  @Post("tickets/email")
  @ApiOkResponse({ description: "Queue ticket email without SMTP integration" })
  emailTicket(@Body() dto: TicketEmailDto): Promise<TicketEmailResponse> {
    return this.service.emailTicket(dto);
  }
}
