import { Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

@Injectable()
export class TrackingModuleValidator {
  ensureReady(summary: ModuleSummary): void {
    if (summary.status !== "READY_FOR_INTEGRATION") {
      throw new Error("Tracking module is not ready for integration");
    }

    if (summary.capabilities.length === 0) {
      throw new Error("Tracking module must expose at least one capability");
    }
  }
}
