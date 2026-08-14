import { Module } from "@nestjs/common";

import { SchedulerController } from "./controllers/scheduler.controller";
import { SchedulerRepository } from "./repositories/scheduler.repository";
import { SchedulerService } from "./services/scheduler.service";
import { SchedulerValidator } from "./validators/scheduler.validator";

@Module({
  controllers: [SchedulerController],
  providers: [SchedulerService, SchedulerRepository, SchedulerValidator],
  exports: [SchedulerService],
})
export class SchedulerModule {}
