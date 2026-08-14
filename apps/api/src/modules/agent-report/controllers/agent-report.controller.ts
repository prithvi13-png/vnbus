import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { AgentReportsResponse } from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { AgentReportQueryDto } from "../dto/agent-report.dto";
import { AgentReportService } from "../services/agent-report.service";

@ApiTags("Agent Reports")
@ApiBearerAuth()
@Controller("agent/reports")
export class AgentReportController {
  constructor(private readonly service: AgentReportService) {}

  @Public()
  @Get()
  @ApiOkResponse({ description: "Mock agent reports and chart-ready report series" })
  getReports(@Query() _query: AgentReportQueryDto): AgentReportsResponse {
    return this.service.getReports();
  }
}
