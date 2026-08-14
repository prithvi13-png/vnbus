import { Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

@Injectable()
export class ReportsModuleValidator {
  ensureReady(summary: ModuleSummary): void {
    if (summary.status !== "READY_FOR_INTEGRATION") {
      throw new Error("Reports module is not ready for integration");
    }

    if (summary.capabilities.length === 0) {
      throw new Error("Reports module must expose at least one capability");
    }
  }
}
