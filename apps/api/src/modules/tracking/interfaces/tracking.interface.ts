import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface TrackingModulePort {
  getSummary(): ModuleSummary;
}
