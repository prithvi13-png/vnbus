import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface SeatModulePort {
  getSummary(): ModuleSummary;
}
