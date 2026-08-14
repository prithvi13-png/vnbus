import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface AdminModulePort {
  getSummary(): ModuleSummary;
}
