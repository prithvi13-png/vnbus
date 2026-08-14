import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface SupplierModulePort {
  getSummary(): ModuleSummary;
}
