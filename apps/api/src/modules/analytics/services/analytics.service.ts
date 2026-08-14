import { Injectable } from "@nestjs/common";
import type { AdminAnalyticsResponse } from "@vnbus/types";

import { AnalyticsSummaryDto } from "../dto/analytics-summary.dto";
import type { AnalyticsModulePort } from "../interfaces/analytics.interface";
import { AnalyticsRepository } from "../repositories/analytics.repository";
import { AnalyticsModuleValidator } from "../validators/analytics.validator";

@Injectable()
export class AnalyticsService implements AnalyticsModulePort {
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly validator: AnalyticsModuleValidator,
  ) {}

  getSummary(): AnalyticsSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new AnalyticsSummaryDto(summary);
  }

  getAdminAnalytics(): AdminAnalyticsResponse {
    return this.repository.getAdminAnalytics();
  }
}
