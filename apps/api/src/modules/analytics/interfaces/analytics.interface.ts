import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface AnalyticsModulePort {
  getSummary(): ModuleSummary;
}
