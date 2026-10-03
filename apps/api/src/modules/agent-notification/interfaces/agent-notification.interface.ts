import type { NotificationReadStatus, NotificationRecord } from "@vnbus/types";

export interface AgentNotificationModulePort {
  listNotifications(userId: string, readStatus?: NotificationReadStatus): NotificationRecord[];
}
