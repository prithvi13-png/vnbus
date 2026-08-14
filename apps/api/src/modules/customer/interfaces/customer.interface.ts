import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface CustomerModulePort {
  getSummary(): ModuleSummary;
}
