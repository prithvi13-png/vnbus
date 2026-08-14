import type { ModuleCapability, ModuleSummary } from "../../../shared/domain/module-summary";

export class ReportsSummaryDto implements ModuleSummary {
  readonly module: string;
  readonly boundedContext: string;
  readonly status: "READY_FOR_INTEGRATION";
  readonly capabilities: ModuleCapability[];

  constructor(summary: ModuleSummary) {
    this.module = summary.module;
    this.boundedContext = summary.boundedContext;
    this.status = summary.status;
    this.capabilities = summary.capabilities;
  }
}
