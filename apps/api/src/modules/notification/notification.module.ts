import { Module } from "@nestjs/common";

import { NotificationController } from "./controllers/notification.controller";
import { NotificationRepository } from "./repositories/notification.repository";
import { NotificationService } from "./services/notification.service";
import { NotificationModuleValidator } from "./validators/notification.validator";

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository, NotificationModuleValidator],
  exports: [NotificationService],
})
export class NotificationModule {}
