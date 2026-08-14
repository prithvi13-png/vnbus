import type { NotificationRecord } from "@vnbus/types";

export class AgentNotificationEntity implements NotificationRecord {
  readonly id!: NotificationRecord["id"];
  readonly type!: NotificationRecord["type"];
  readonly readStatus!: NotificationRecord["readStatus"];
  readonly title!: NotificationRecord["title"];
  readonly body!: NotificationRecord["body"];
  readonly bookingId?: string;
  readonly emailLogId?: string;
  readonly createdAt!: NotificationRecord["createdAt"];
  readonly readAt!: NotificationRecord["readAt"];

  constructor(notification: NotificationRecord) {
    Object.assign(this, notification);
  }
}
