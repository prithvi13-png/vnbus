import type { ModuleSummary } from "../../../shared/domain/module-summary";

export class SettingsContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number,
  ) {}

  static fromSummary(summary: ModuleSummary): SettingsContextEntity {
    return new SettingsContextEntity(
      summary.module,
      summary.boundedContext,
      summary.capabilities.length,
    );
  }
}
