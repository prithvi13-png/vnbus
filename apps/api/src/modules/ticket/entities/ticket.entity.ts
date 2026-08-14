import type { ModuleSummary } from "../../../shared/domain/module-summary";

export class TicketContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number,
  ) {}

  static fromSummary(summary: ModuleSummary): TicketContextEntity {
    return new TicketContextEntity(
      summary.module,
      summary.boundedContext,
      summary.capabilities.length,
    );
  }
}
