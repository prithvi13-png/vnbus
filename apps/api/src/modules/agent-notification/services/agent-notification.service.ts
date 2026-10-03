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

  listNotifications(userId: string, readStatus?: NotificationReadStatus): NotificationRecord[] {
    this.validator.ensureReady(this.repository.findSummary());

    return this.notificationService
      .listNotifications(userId)
      .filter((notification) => !readStatus || notification.readStatus === readStatus)
      .map((notification) => this.mapper.toEntity(notification));
  }
}
