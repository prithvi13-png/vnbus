import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type {
  AgentBookingListResponse,
  CreateAgentBookingResponse,
  TicketEmailResponse,
} from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import {
  AgentBookingListQueryDto,
  AgentEmailTicketDto,
  CreateAgentBookingDto,
} from "../dto/agent-booking.dto";
import { AgentBookingService } from "../services/agent-booking.service";

@ApiTags("Agent Bookings")
@ApiBearerAuth()
@Controller("agent/bookings")
export class AgentBookingController {
  constructor(private readonly service: AgentBookingService) {}

  @Public()
  @Get()
  @ApiOkResponse({
    description: "Agent booking list with search, filters, sorting, and pagination",
  })
  listBookings(@Query() query: AgentBookingListQueryDto): AgentBookingListResponse {
    return this.service.listBookings(query);
  }

  @Public()
  @Post()
  @ApiOkResponse({ description: "Create an agent-owned booking using the shared booking engine" })
  createBooking(@Body() dto: CreateAgentBookingDto): Promise<CreateAgentBookingResponse> {
    return this.service.createBooking(dto);
  }

  @Public()
  @Post("email-ticket")
  @ApiOkResponse({ description: "Email a generated ticket from the agent workspace" })
  emailTicket(@Body() dto: AgentEmailTicketDto): Promise<TicketEmailResponse> {
    return this.service.emailTicket(dto);
  }
}
