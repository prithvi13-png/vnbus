import type { ModuleSummary } from "../../../shared/domain/module-summary";

export class PassengerContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number,
  ) {}

  static fromSummary(summary: ModuleSummary): PassengerContextEntity {
    return new PassengerContextEntity(
      summary.module,
      summary.boundedContext,
      summary.capabilities.length,
    );
  }
}
