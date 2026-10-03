import { Module } from "@nestjs/common";

import { BookingModule } from "../booking/booking.module";
import { AnalyticsController } from "./controllers/analytics.controller";
import { AnalyticsRepository } from "./repositories/analytics.repository";
import { AnalyticsService } from "./services/analytics.service";
import { AnalyticsModuleValidator } from "./validators/analytics.validator";

@Module({
  imports: [BookingModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsRepository, AnalyticsModuleValidator],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
