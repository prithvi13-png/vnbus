import { Module } from "@nestjs/common";

import { TimelineController } from "./controllers/timeline.controller";
import { TimelineRepository } from "./repositories/timeline.repository";
import { TimelineService } from "./services/timeline.service";
import { TimelineModuleValidator } from "./validators/timeline.validator";

@Module({
  controllers: [TimelineController],
  providers: [TimelineService, TimelineRepository, TimelineModuleValidator],
  exports: [TimelineService],
})
export class TimelineModule {}
