import { Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

@Injectable()
export class SupplierModuleValidator {
  ensureReady(summary: ModuleSummary): void {
    if (summary.status !== "READY_FOR_INTEGRATION") {
      throw new Error("Supplier module is not ready for integration");
    }

    if (summary.capabilities.length === 0) {
      throw new Error("Supplier module must expose at least one capability");
    }
  }
}
