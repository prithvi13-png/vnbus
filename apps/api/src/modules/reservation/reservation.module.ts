import { Module } from "@nestjs/common";

import { ReservationController } from "./controllers/reservation.controller";
import { ReservationRepository } from "./repositories/reservation.repository";
import { ReservationService } from "./services/reservation.service";
import { ReservationModuleValidator } from "./validators/reservation.validator";

@Module({
  controllers: [ReservationController],
  providers: [ReservationService, ReservationRepository, ReservationModuleValidator],
  exports: [ReservationService],
})
export class ReservationModule {}
