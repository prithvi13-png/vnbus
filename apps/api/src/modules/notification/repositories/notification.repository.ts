import { Injectable } from "@nestjs/common";
import type {
  AdminNotificationCenterResponse,
  AdminNotificationTemplateRecord,
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
  private readonly notifications = new Map<string, NotificationRecord>(
    seedHistory().map((notification) => [notification.id, notification]),
  );
  private readonly templates = seedTemplates();

  findSummary(): ModuleSummary {
    return summary;
  }

  save(notification: NotificationRecord): NotificationRecord {
    this.notifications.set(notification.id, notification);

    return notification;
  }

  list(): NotificationRecord[] {
    return [...this.notifications.values()].sort(
      (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
    );
  }

  listActive(): NotificationRecord[] {
    return this.list().filter((notification) => !notification.deletedAt);
  }

  getNotificationCenter(): NotificationCenterResponse {
    const history = this.listActive();
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

  getAdminCenter(): AdminNotificationCenterResponse {
    return {
      history: this.listActive(),
      templates: this.templates,
      queue: {
        name: "Notification Queue",
        queued: 41,
        sent: 3920,
        failed: 4,
        retryScheduled: 9,
      },
    };
  }

  find(notificationId: string): NotificationRecord | null {
    return this.notifications.get(notificationId) ?? null;
  }

  markAllRead(): NotificationCenterResponse {
    const readAt = new Date().toISOString();

    for (const notification of this.notifications.values()) {
      if (!notification.deletedAt && notification.readStatus === "UNREAD") {
        this.notifications.set(notification.id, {
          ...notification,
          readStatus: "READ",
          readAt,
        });
      }
    }

    return this.getNotificationCenter();
  }
}

function seedTemplates(): AdminNotificationTemplateRecord[] {
  return [
    {
      templateId: "NTPL-CUSTOMER-DELAY",
      name: "Journey delay",
      audience: "CUSTOMER",
      channel: "IN_APP",
      variables: ["bookingReference", "delayMinutes"],
      status: "ACTIVE",
    },
    {
      templateId: "NTPL-AGENT-SETTLEMENT",
      name: "Agent settlement ready",
      audience: "AGENT",
      channel: "EMAIL",
      variables: ["agencyName", "reportMonth"],
      status: "ACTIVE",
    },
    {
      templateId: "NTPL-CUSTOMER-WHATSAPP",
      name: "WhatsApp journey reminder",
      audience: "CUSTOMER",
      channel: "WHATSAPP",
      variables: ["bookingReference", "departureTime"],
      status: "DRAFT",
    },
    {
      templateId: "NTPL-CUSTOMER-SMS",
      name: "SMS OTP and alert placeholder",
      audience: "CUSTOMER",
      channel: "SMS",
      variables: ["otp", "bookingReference"],
      status: "DRAFT",
    },
    {
      templateId: "NTPL-BROADCAST-MAINTENANCE",
      name: "Maintenance broadcast",
      audience: "BROADCAST",
      channel: "PUSH",
      variables: ["window"],
      status: "DRAFT",
    },
  ];
}

function seedHistory(): NotificationRecord[] {
  return [
    {
      id: "NTF-ADM-001",
      type: "ADMIN_BROADCAST",
      readStatus: "UNREAD",
      channel: "IN_APP",
      title: "Scheduled maintenance",
      body: "Admin broadcast prepared for mock maintenance window.",
      createdAt: "2026-08-08T08:10:00.000Z",
      readAt: null,
    },
    {
      id: "NTF-ADM-002",
      type: "ADMIN_AGENT_MESSAGE",
      readStatus: "READ",
      channel: "EMAIL",
      title: "Settlement report ready",
      body: "Agent settlement report is ready for download.",
      createdAt: "2026-08-08T07:55:00.000Z",
      readAt: "2026-08-08T08:00:00.000Z",
    },
  ];
}
