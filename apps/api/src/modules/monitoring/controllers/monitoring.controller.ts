import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { AdminMonitoringResponse } from "@vnbus/types";

import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { MonitoringQueryDto } from "../dto/monitoring-query.dto";
import { MonitoringService } from "../services/monitoring.service";

@ApiTags("Monitoring")
@ApiBearerAuth()
@Controller("monitoring")
export class MonitoringController {
  constructor(private readonly service: MonitoringService) {}

  @Roles("ADMIN")
  @Get()
  @ApiOkResponse({ description: "Mock system monitoring dashboard" })
  getDashboard(@Query() query: MonitoringQueryDto): AdminMonitoringResponse {
    return this.service.getDashboard(query);
  }
}
