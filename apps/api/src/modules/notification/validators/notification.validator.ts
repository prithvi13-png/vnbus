import { Injectable, NotFoundException } from "@nestjs/common";
import type { NotificationRecord } from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

@Injectable()
export class NotificationModuleValidator {
  ensureReady(summary: ModuleSummary): void {
    if (summary.status !== "READY_FOR_INTEGRATION") {
      throw new Error("Notification module is not ready for integration");
    }

    if (summary.capabilities.length === 0) {
      throw new Error("Notification module must expose at least one capability");
    }
  }

  ensureNotification(
    notification: NotificationRecord | null,
  ): asserts notification is NotificationRecord {
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }
  }
}
