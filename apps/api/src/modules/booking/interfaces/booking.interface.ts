import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface BookingModulePort {
  getSummary(): ModuleSummary;
}
