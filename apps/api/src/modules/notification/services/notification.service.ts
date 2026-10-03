import { Injectable } from "@nestjs/common";
import type {
  AdminNotificationCenterResponse,
  NotificationCenterResponse,
  NotificationChannel,
  NotificationRecord,
  NotificationType,
} from "@vnbus/types";

import type { SendAdminNotificationDto } from "../dto/admin-notification.dto";
import { NotificationSummaryDto } from "../dto/notification-summary.dto";
import type { NotificationModulePort } from "../interfaces/notification.interface";
import { NotificationRepository } from "../repositories/notification.repository";
import { NotificationModuleValidator } from "../validators/notification.validator";

@Injectable()
export class NotificationService implements NotificationModulePort {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly validator: NotificationModuleValidator,
  ) {}

  getSummary(): NotificationSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new NotificationSummaryDto(summary);
  }

  /** Pass userId for a personal notification; omit it only for a broadcast. */
  create(input: {
    userId?: string;
    type: NotificationType;
    title: string;
    body: string;
    channel?: NotificationChannel;
    bookingId?: string;
    emailLogId?: string;
  }): NotificationRecord {
    const createdAt = new Date().toISOString();
    const notification: NotificationRecord = {
      id: createNotificationId(input.type, input.title, createdAt),
      ...(input.userId ? { userId: input.userId } : {}),
      type: input.type,
      readStatus: "UNREAD",
      title: input.title,
      body: input.body,
      channel: input.channel ?? "IN_APP",
      ...(input.bookingId ? { bookingId: input.bookingId } : {}),
      ...(input.emailLogId ? { emailLogId: input.emailLogId } : {}),
      createdAt,
      readAt: null,
    };

    return this.repository.save(notification);
  }

  listNotifications(userId: string): NotificationRecord[] {
    return this.repository.listActive(userId);
  }

  getNotificationCenter(userId: string): NotificationCenterResponse {
    return this.repository.getNotificationCenter(userId);
  }

  getAdminCenter(): AdminNotificationCenterResponse {
    return this.repository.getAdminCenter();
  }

  sendAdminNotification(dto: SendAdminNotificationDto): NotificationRecord {
    const type: NotificationType =
      dto.audience === "CUSTOMER"
        ? "ADMIN_CUSTOMER_MESSAGE"
        : dto.audience === "AGENT"
          ? "ADMIN_AGENT_MESSAGE"
          : "ADMIN_BROADCAST";

    return this.create({
      type,
      title: dto.title,
      body: dto.body,
    });
  }

  markRead(notificationId: string, userId: string): NotificationRecord {
    const notification = this.repository.find(notificationId, userId);
    this.validator.ensureNotification(notification);
    const updated: NotificationRecord = {
      ...notification,
      readStatus: "READ",
      readAt: new Date().toISOString(),
    };

    return this.repository.save(updated);
  }

  markAllRead(userId: string): NotificationCenterResponse {
    return this.repository.markAllRead(userId);
  }

  archive(notificationId: string, userId: string): NotificationRecord {
    const notification = this.repository.find(notificationId, userId);
    this.validator.ensureNotification(notification);
    const archived: NotificationRecord = {
      ...notification,
      readStatus: "ARCHIVED",
      archivedAt: new Date().toISOString(),
    };

    return this.repository.save(archived);
  }

  delete(notificationId: string, userId: string): NotificationCenterResponse {
    const notification = this.repository.find(notificationId, userId);
    this.validator.ensureNotification(notification);
    this.repository.save({
      ...notification,
      deletedAt: new Date().toISOString(),
    });

    return this.repository.getNotificationCenter(userId);
  }
}

function createNotificationId(type: string, title: string, createdAt: string): string {
  const hash = [...`${type}|${title}|${createdAt}`].reduce(
    (value, char) => (value * 31 + char.charCodeAt(0)) >>> 0,
    2166136261,
  );

  return `NTF-${hash.toString(36).toUpperCase().padStart(8, "0").slice(0, 8)}`;
}
