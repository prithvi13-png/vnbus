import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { AgentDashboardResponse } from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
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

  @Public()
  @Get("dashboard")
  @ApiOkResponse({ description: "B2B travel agent dashboard metrics and activity" })
  getDashboard(): AgentDashboardResponse {
    return this.service.getDashboard();
  }
}
