import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface CmsModulePort {
  getSummary(): ModuleSummary;
}
