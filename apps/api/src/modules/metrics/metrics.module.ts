import { Module } from "@nestjs/common";

import { CacheModule } from "../cache/cache.module";
import { QueueSystemModule } from "../queue-system/queue-system.module";
import { MetricsController } from "./controllers/metrics.controller";
import { MetricsRepository } from "./repositories/metrics.repository";
import { MetricsService } from "./services/metrics.service";
import { MetricsValidator } from "./validators/metrics.validator";

@Module({
  imports: [CacheModule, QueueSystemModule],
  controllers: [MetricsController],
  providers: [MetricsService, MetricsRepository, MetricsValidator],
  exports: [MetricsService],
})
export class MetricsModule {}
