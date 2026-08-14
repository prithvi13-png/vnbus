import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface AuditModulePort {
  getSummary(): ModuleSummary;
}
