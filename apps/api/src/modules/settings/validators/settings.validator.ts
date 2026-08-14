import { Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

@Injectable()
export class SettingsModuleValidator {
  ensureReady(summary: ModuleSummary): void {
    if (summary.status !== "READY_FOR_INTEGRATION") {
      throw new Error("Settings module is not ready for integration");
    }

    if (summary.capabilities.length === 0) {
      throw new Error("Settings module must expose at least one capability");
    }
  }
}
