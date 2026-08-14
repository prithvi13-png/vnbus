import type { ModuleSummary } from "../../../shared/domain/module-summary";

export class AiContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number,
  ) {}

  static fromSummary(summary: ModuleSummary): AiContextEntity {
    return new AiContextEntity(summary.module, summary.boundedContext, summary.capabilities.length);
  }
}
