import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface PassengerModulePort {
  getSummary(): ModuleSummary;
}
