import { Controller, Get, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { AgentReportsResponse } from "@vnbus/types";

import { Roles } from "../../../shared/security/decorators/roles.decorator";
import type { AuthenticatedRequest } from "../../../shared/security/interfaces/authenticated-request.interface";
import { requirePrincipal } from "../../../shared/security/require-user";
import { AgentReportQueryDto } from "../dto/agent-report.dto";
import { AgentReportService } from "../services/agent-report.service";

@ApiTags("Agent Reports")
@ApiBearerAuth()
@Controller("agent/reports")
export class AgentReportController {
  constructor(private readonly service: AgentReportService) {}

  @Roles("TRAVEL_AGENT")
  @Get()
  @ApiOkResponse({ description: "Reports over the signed-in agent's bookings" })
  getReports(
    @Query() _query: AgentReportQueryDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<AgentReportsResponse> {
    return this.service.getReports(requirePrincipal(request));
  }
}
