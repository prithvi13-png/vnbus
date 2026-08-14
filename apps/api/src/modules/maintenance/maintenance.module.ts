import { Module } from "@nestjs/common";

import { MaintenanceController } from "./controllers/maintenance.controller";
import { MaintenanceGuard } from "./guards/maintenance.guard";
import { MaintenanceService } from "./services/maintenance.service";

@Module({
  controllers: [MaintenanceController],
  providers: [MaintenanceService, MaintenanceGuard],
  exports: [MaintenanceService, MaintenanceGuard],
})
export class MaintenanceModule {}
