import { Module } from "@nestjs/common";

import { TrackingController } from "./controllers/tracking.controller";
import { TrackingRepository } from "./repositories/tracking.repository";
import { TrackingService } from "./services/tracking.service";
import { TrackingModuleValidator } from "./validators/tracking.validator";

@Module({
  controllers: [TrackingController],
  providers: [TrackingService, TrackingRepository, TrackingModuleValidator],
  exports: [TrackingService],
})
export class TrackingModule {}
