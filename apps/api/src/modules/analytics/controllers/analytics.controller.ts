import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { AdminAnalyticsResponse } from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { AnalyticsSummaryDto } from "../dto/analytics-summary.dto";
import { AnalyticsService } from "../services/analytics.service";

@ApiTags("Analytics")
@ApiBearerAuth()
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Public()
  @Get("health")
  getHealth(): AnalyticsSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("capabilities")
  getCapabilities(): AnalyticsSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("dashboard")
  @ApiOkResponse({ description: "Admin analytics dashboard datasets" })
  getAdminAnalytics(): AdminAnalyticsResponse {
    return this.service.getAdminAnalytics();
  }
}
