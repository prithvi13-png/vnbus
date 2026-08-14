import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface CouponsModulePort {
  getSummary(): ModuleSummary;
}
