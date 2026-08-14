import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface NotificationModulePort {
  getSummary(): ModuleSummary;
}
