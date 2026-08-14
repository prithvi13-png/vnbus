import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface ReservationModulePort {
  getSummary(): ModuleSummary;
}
