import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface OffersModulePort {
  getSummary(): ModuleSummary;
}
