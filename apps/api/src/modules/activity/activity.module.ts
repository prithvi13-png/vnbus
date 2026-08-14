import { Module } from "@nestjs/common";

import { ActivityController } from "./controllers/activity.controller";
import { ActivityRepository } from "./repositories/activity.repository";
import { ActivityService } from "./services/activity.service";
import { ActivityValidator } from "./validators/activity.validator";

@Module({
  controllers: [ActivityController],
  providers: [ActivityService, ActivityRepository, ActivityValidator],
  exports: [ActivityService],
})
export class ActivityModule {}
