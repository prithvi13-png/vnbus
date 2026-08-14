import { Module } from "@nestjs/common";

import { IntegrationModule } from "../integration/integration.module";
import { SeatController } from "./controllers/seat.controller";
import { SeatRepository } from "./repositories/seat.repository";
import { SeatService } from "./services/seat.service";
import { SeatModuleValidator } from "./validators/seat.validator";

@Module({
  imports: [IntegrationModule],
  controllers: [SeatController],
  providers: [SeatService, SeatRepository, SeatModuleValidator],
  exports: [SeatService],
})
export class SeatModule {}
