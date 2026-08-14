import type { ModuleSummary } from "../../../shared/domain/module-summary";
import type { AdminAnalyticsResponse } from "@vnbus/types";

export class AnalyticsContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number,
  ) {}

  static fromSummary(summary: ModuleSummary): AnalyticsContextEntity {
    return new AnalyticsContextEntity(
      summary.module,
      summary.boundedContext,
      summary.capabilities.length,
    );
  }
}

export class AdminAnalyticsEntity {
  constructor(readonly analytics: AdminAnalyticsResponse) {}
}
