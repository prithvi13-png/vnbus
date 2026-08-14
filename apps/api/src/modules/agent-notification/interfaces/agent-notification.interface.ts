import type { NotificationReadStatus, NotificationRecord } from "@vnbus/types";

export interface AgentNotificationModulePort {
  listNotifications(readStatus?: NotificationReadStatus): NotificationRecord[];
}
