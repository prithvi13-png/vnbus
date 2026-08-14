import { Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

@Injectable()
export class ReservationModuleValidator {
  ensureReady(summary: ModuleSummary): void {
    if (summary.status !== "READY_FOR_INTEGRATION") {
      throw new Error("Reservation module is not ready for integration");
    }

    if (summary.capabilities.length === 0) {
      throw new Error("Reservation module must expose at least one capability");
    }
  }
}
