import { Module } from "@nestjs/common";

import { NotificationModule } from "../notification/notification.module";
import { AgentNotificationController } from "./controllers/agent-notification.controller";
import { AgentNotificationMapper } from "./mappers/agent-notification.mapper";
import { AgentNotificationRepository } from "./repositories/agent-notification.repository";
import { AgentNotificationService } from "./services/agent-notification.service";
import { AgentNotificationValidator } from "./validators/agent-notification.validator";

@Module({
  imports: [NotificationModule],
  controllers: [AgentNotificationController],
  providers: [
    AgentNotificationService,
    AgentNotificationRepository,
    AgentNotificationValidator,
    AgentNotificationMapper,
  ],
  exports: [AgentNotificationService],
})
export class AgentNotificationModule {}
