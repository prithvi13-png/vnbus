import type { ModuleSummary } from "../../../shared/domain/module-summary";

export class ReservationContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number,
  ) {}

  static fromSummary(summary: ModuleSummary): ReservationContextEntity {
    return new ReservationContextEntity(
      summary.module,
      summary.boundedContext,
      summary.capabilities.length,
    );
  }
}
