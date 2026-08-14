import type { ModuleSummary } from "../../../shared/domain/module-summary";

export class TrackingContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number,
  ) {}

  static fromSummary(summary: ModuleSummary): TrackingContextEntity {
    return new TrackingContextEntity(
      summary.module,
      summary.boundedContext,
      summary.capabilities.length,
    );
  }
}
