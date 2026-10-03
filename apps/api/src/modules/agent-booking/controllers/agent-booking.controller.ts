import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type {
  AgentBookingListResponse,
  CreateAgentBookingResponse,
  TicketEmailResponse,
} from "@vnbus/types";

import { Roles } from "../../../shared/security/decorators/roles.decorator";
import type { AuthenticatedRequest } from "../../../shared/security/interfaces/authenticated-request.interface";
import { requirePrincipal } from "../../../shared/security/require-user";
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

  // Agents only: these routes sell real seats on the platform's supplier
  // account and list the agent's customers' bookings.
  @Roles("TRAVEL_AGENT")
  @Get()
  @ApiOkResponse({
    description: "Agent booking list with search, filters, sorting, and pagination",
  })
  listBookings(
    @Query() query: AgentBookingListQueryDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<AgentBookingListResponse> {
    return this.service.listBookings(requirePrincipal(request), query);
  }

  @Roles("TRAVEL_AGENT")
  @Post()
  @ApiOkResponse({ description: "Book seats with the supplier for one of the agent's customers" })
  createBooking(
    @Body() dto: CreateAgentBookingDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<CreateAgentBookingResponse> {
    return this.service.createBooking(requirePrincipal(request), dto);
  }

  @Roles("TRAVEL_AGENT")
  @Post("email-ticket")
  @ApiOkResponse({ description: "Email a generated ticket from the agent workspace" })
  emailTicket(
    @Body() dto: AgentEmailTicketDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<TicketEmailResponse> {
    return this.service.emailTicket(requirePrincipal(request), dto);
  }
}
