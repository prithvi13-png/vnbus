import { Module } from "@nestjs/common";

import { HealthController } from "./controllers/health.controller";
import { HealthRepository } from "./repositories/health.repository";
import { HealthService } from "./services/health.service";
import { HealthValidator } from "./validators/health.validator";

@Module({
  controllers: [HealthController],
  providers: [HealthService, HealthRepository, HealthValidator],
  exports: [HealthService],
})
export class HealthModule {}
