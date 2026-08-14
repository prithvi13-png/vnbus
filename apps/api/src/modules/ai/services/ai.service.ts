import { Injectable } from "@nestjs/common";
import type { RecommendationEngineResponse, RecentlyViewedRouteRequest } from "@vnbus/types";

import type { RecommendationQueryDto } from "../dto/recommendation.dto";
import { AiSummaryDto } from "../dto/ai-summary.dto";
import type { AiModulePort } from "../interfaces/ai.interface";
import { AiRepository } from "../repositories/ai.repository";
import { AiModuleValidator } from "../validators/ai.validator";

@Injectable()
export class AiService implements AiModulePort {
  constructor(
    private readonly repository: AiRepository,
    private readonly validator: AiModuleValidator,
  ) {}

  getSummary(): AiSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new AiSummaryDto(summary);
  }

  getRecommendations(query: RecommendationQueryDto = {}): RecommendationEngineResponse {
    return this.repository.getRecommendations(query);
  }

  recordRecentlyViewed(input: RecentlyViewedRouteRequest): RecommendationEngineResponse {
    return this.repository.recordRecentlyViewed(input);
  }
}
