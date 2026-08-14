import type { ModuleSummary } from "../../../shared/domain/module-summary";

export class BookingContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number,
  ) {}

  static fromSummary(summary: ModuleSummary): BookingContextEntity {
    return new BookingContextEntity(
      summary.module,
      summary.boundedContext,
      summary.capabilities.length,
    );
  }
}
