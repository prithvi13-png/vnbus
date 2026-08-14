import type { ModuleSummary } from "../../../shared/domain/module-summary";
import type { AdminNotificationCenterResponse } from "@vnbus/types";

export class NotificationContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number,
  ) {}

  static fromSummary(summary: ModuleSummary): NotificationContextEntity {
    return new NotificationContextEntity(
      summary.module,
      summary.boundedContext,
      summary.capabilities.length,
    );
  }
}

export class AdminNotificationCenterEntity {
  constructor(readonly center: AdminNotificationCenterResponse) {}
}
