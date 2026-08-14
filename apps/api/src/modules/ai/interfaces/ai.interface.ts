import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface AiModulePort {
  getSummary(): ModuleSummary;
}
