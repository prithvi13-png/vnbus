import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface TicketModulePort {
  getSummary(): ModuleSummary;
}
