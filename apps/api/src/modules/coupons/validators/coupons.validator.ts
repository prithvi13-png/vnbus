import { Injectable, NotFoundException } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

@Injectable()
export class CouponsModuleValidator {
  ensureReady(summary: ModuleSummary): void {
    if (summary.status !== "READY_FOR_INTEGRATION") {
      throw new Error("Coupons module is not ready for integration");
    }

    if (summary.capabilities.length === 0) {
      throw new Error("Coupons module must expose at least one capability");
    }
  }

  ensureFound<T>(value: T | null | undefined, label: string): asserts value is T {
    if (!value) {
      throw new NotFoundException(`${label} not found`);
    }
  }
}
