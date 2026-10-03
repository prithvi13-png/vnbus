import { Module } from "@nestjs/common";

import { BookingModule } from "../booking/booking.module";
import { ReportsController } from "./controllers/reports.controller";
import { ReportsRepository } from "./repositories/reports.repository";
import { ReportsService } from "./services/reports.service";
import { ReportsModuleValidator } from "./validators/reports.validator";

@Module({
  imports: [BookingModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsRepository, ReportsModuleValidator],
  exports: [ReportsService],
})
export class ReportsModule {}
