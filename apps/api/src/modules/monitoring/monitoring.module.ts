import { Module } from "@nestjs/common";

import { MonitoringController } from "./controllers/monitoring.controller";
import { MonitoringRepository } from "./repositories/monitoring.repository";
import { MonitoringService } from "./services/monitoring.service";
import { MonitoringValidator } from "./validators/monitoring.validator";

@Module({
  controllers: [MonitoringController],
  providers: [MonitoringService, MonitoringRepository, MonitoringValidator],
  exports: [MonitoringService],
})
export class MonitoringModule {}
