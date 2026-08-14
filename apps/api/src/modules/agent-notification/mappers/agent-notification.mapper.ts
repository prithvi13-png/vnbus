import { Injectable } from "@nestjs/common";
import type { NotificationRecord } from "@vnbus/types";

import { AgentNotificationEntity } from "../entities/agent-notification.entity";

@Injectable()
export class AgentNotificationMapper {
  toEntity(notification: NotificationRecord): AgentNotificationEntity {
    return new AgentNotificationEntity(notification);
  }
}
