import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface SettingsModulePort {
  getSummary(): ModuleSummary;
}
