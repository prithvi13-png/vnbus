import { Injectable } from "@nestjs/common";
import type {
  AdminNotificationCenterResponse,
  NotificationCenterResponse,
  NotificationRecord,
} from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "notification",
  boundedContext: "Notification delivery",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Delivery queue",
      description: "Prepare asynchronous in-app and email notification jobs.",
    },
    {
      name: "Preference checks",
      description: "Respect customer and agent notification preferences.",
    },
    {
      name: "Template binding",
      description: "Connect notifications to email template records.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class NotificationRepository {
  private readonly notifications = new Map<string, NotificationRecord>();

  findSummary(): ModuleSummary {
    return summary;
  }

  save(notification: NotificationRecord): NotificationRecord {
    this.notifications.set(notification.id, notification);

    return notification;
  }

  /** Everything a user can see: their own notifications and admin broadcasts. */
  listActive(userId: string): NotificationRecord[] {
    return [...this.notifications.values()]
      .filter(
        (notification) =>
          !notification.deletedAt && (!notification.userId || notification.userId === userId),
      )
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  }

  getNotificationCenter(userId: string): NotificationCenterResponse {
    const history = this.listActive(userId);
    const unread = history.filter((notification) => notification.readStatus === "UNREAD");
    const read = history.filter((notification) => notification.readStatus === "READ");
    const archived = history.filter((notification) => notification.readStatus === "ARCHIVED");

    return {
      unread,
      read,
      archived,
      history,
      counts: {
        unread: unread.length,
        read: read.length,
        archived: archived.length,
        total: history.length,
      },
    };
  }

  /**
   * In-app notifications are delivered the moment they are created, so the
   * queue figures are counts of what exists rather than a separate tally.
   */
  getAdminCenter(): AdminNotificationCenterResponse {
    const history = [...this.notifications.values()]
      .filter((notification) => !notification.deletedAt)
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));

    return {
      history,
      templates: [],
      queue: {
        name: "Notification Queue",
        queued: 0,
        sent: history.length,
        failed: 0,
        retryScheduled: 0,
      },
    };
  }

  /** A notification the user may act on, or null when it is not theirs. */
  find(notificationId: string, userId: string): NotificationRecord | null {
    const notification = this.notifications.get(notificationId);

    if (!notification || (notification.userId && notification.userId !== userId)) {
      return null;
    }

    return notification;
  }

  markAllRead(userId: string): NotificationCenterResponse {
    const readAt = new Date().toISOString();

    for (const notification of this.listActive(userId)) {
      if (notification.readStatus === "UNREAD") {
        this.notifications.set(notification.id, {
          ...notification,
          readStatus: "READ",
          readAt,
        });
      }
    }

    return this.getNotificationCenter(userId);
  }
}
