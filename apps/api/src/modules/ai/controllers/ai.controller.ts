import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { RecommendationEngineResponse } from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { AiSummaryDto } from "../dto/ai-summary.dto";
import { RecommendationQueryDto, RecentlyViewedRouteDto } from "../dto/recommendation.dto";
import { AiService } from "../services/ai.service";

@ApiTags("Ai")
@ApiBearerAuth()
@Controller("ai")
export class AiController {
  constructor(private readonly service: AiService) {}

  @Public()
  @Get("health")
  getHealth(): AiSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("capabilities")
  getCapabilities(): AiSummaryDto {
    return this.service.getSummary();
  }

  @Public()
  @Get("recommendations")
  @ApiOkResponse({ description: "Mock AI trip recommendations with future LLM architecture" })
  getRecommendations(@Query() query: RecommendationQueryDto): RecommendationEngineResponse {
    return this.service.getRecommendations(query);
  }

  @Public()
  @Post("recommendations/recently-viewed")
  @ApiOkResponse({ description: "Record a recently viewed route for recommendations" })
  recordRecentlyViewed(@Body() dto: RecentlyViewedRouteDto): RecommendationEngineResponse {
    return this.service.recordRecentlyViewed(dto);
  }
}
