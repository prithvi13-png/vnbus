import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface AgentModulePort {
  getSummary(): ModuleSummary;
}
