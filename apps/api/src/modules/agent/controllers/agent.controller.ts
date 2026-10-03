import { Controller, Get, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { AgentDashboardResponse } from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import type { AuthenticatedRequest } from "../../../shared/security/interfaces/authenticated-request.interface";
import { requirePrincipal } from "../../../shared/security/require-user";
import { AgentSummaryDto } from "../dto/agent-summary.dto";
import { AgentService } from "../services/agent.service";

@ApiTags("Agent")
@ApiBearerAuth()
@Controller("agent")
export class AgentController {
  constructor(private readonly service: AgentService) {}

  @Public()
  @Get("health")
  getHealth(): AgentSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("capabilities")
  getCapabilities(): AgentSummaryDto {
    return this.service.getSummary();
  }

  @Roles("TRAVEL_AGENT")
  @Get("dashboard")
  @ApiOkResponse({ description: "The signed-in agent's dashboard metrics and activity" })
  getDashboard(@Req() request: AuthenticatedRequest): Promise<AgentDashboardResponse> {
    return this.service.getDashboard(requirePrincipal(request));
  }
}
