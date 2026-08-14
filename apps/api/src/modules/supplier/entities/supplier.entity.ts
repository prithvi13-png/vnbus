import type { ModuleSummary } from "../../../shared/domain/module-summary";

export class SupplierContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number,
  ) {}

  static fromSummary(summary: ModuleSummary): SupplierContextEntity {
    return new SupplierContextEntity(
      summary.module,
      summary.boundedContext,
      summary.capabilities.length,
    );
  }
}
