import { Injectable } from "@nestjs/common";
import type { AdminAnalyticsResponse } from "@vnbus/types";

import { BookingService } from "../../booking/services/booking.service";
import { AnalyticsSummaryDto } from "../dto/analytics-summary.dto";
import type { AnalyticsModulePort } from "../interfaces/analytics.interface";
import { AnalyticsRepository } from "../repositories/analytics.repository";
import { AnalyticsModuleValidator } from "../validators/analytics.validator";

@Injectable()
export class AnalyticsService implements AnalyticsModulePort {
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly validator: AnalyticsModuleValidator,
    private readonly bookingService: BookingService,
  ) {}

  getSummary(): AnalyticsSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new AnalyticsSummaryDto(summary);
  }

  async getAdminAnalytics(): Promise<AdminAnalyticsResponse> {
    return this.repository.getAdminAnalytics(await this.bookingService.listAllBookings());
  }
}
