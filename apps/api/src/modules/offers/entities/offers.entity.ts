import type { ModuleSummary } from "../../../shared/domain/module-summary";
import type { AdminOfferRecord } from "@vnbus/types";

export class OffersContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number,
  ) {}

  static fromSummary(summary: ModuleSummary): OffersContextEntity {
    return new OffersContextEntity(
      summary.module,
      summary.boundedContext,
      summary.capabilities.length,
    );
  }
}

export class AdminOfferEntity {
  constructor(readonly offer: AdminOfferRecord) {}
}
