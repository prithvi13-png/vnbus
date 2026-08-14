import type { ModuleSummary } from "../../../shared/domain/module-summary";
import type { AdminReportRecord, AdminReportsResponse } from "@vnbus/types";

export class ReportsContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number,
  ) {}

  static fromSummary(summary: ModuleSummary): ReportsContextEntity {
    return new ReportsContextEntity(
      summary.module,
      summary.boundedContext,
      summary.capabilities.length,
    );
  }
}

export class AdminReportEntity {
  constructor(readonly report: AdminReportRecord) {}
}

export class AdminReportsEntity {
  constructor(readonly reports: AdminReportsResponse) {}
}
