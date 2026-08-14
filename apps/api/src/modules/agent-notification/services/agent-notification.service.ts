import { Injectable } from "@nestjs/common";
import type { NotificationReadStatus, NotificationRecord } from "@vnbus/types";

import { NotificationService } from "../../notification/services/notification.service";
import type { AgentNotificationModulePort } from "../interfaces/agent-notification.interface";
import { AgentNotificationMapper } from "../mappers/agent-notification.mapper";
import { AgentNotificationRepository } from "../repositories/agent-notification.repository";
import { AgentNotificationValidator } from "../validators/agent-notification.validator";

@Injectable()
export class AgentNotificationService implements AgentNotificationModulePort {
  constructor(
    private readonly repository: AgentNotificationRepository,
    private readonly validator: AgentNotificationValidator,
    private readonly notificationService: NotificationService,
    private readonly mapper: AgentNotificationMapper,
  ) {}

  listNotifications(readStatus?: NotificationReadStatus): NotificationRecord[] {
    this.validator.ensureReady(this.repository.findSummary());
    const merged = [
      ...this.notificationService.listNotifications(),
      ...this.repository.listSeed(),
    ].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));

    return merged
      .filter((notification) => !readStatus || notification.readStatus === readStatus)
      .map((notification) => this.mapper.toEntity(notification));
  }
}
