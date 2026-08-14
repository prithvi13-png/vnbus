import { Module } from "@nestjs/common";

import { PassengerController } from "./controllers/passenger.controller";
import { PassengerRepository } from "./repositories/passenger.repository";
import { PassengerService } from "./services/passenger.service";
import { PassengerModuleValidator } from "./validators/passenger.validator";

@Module({
  controllers: [PassengerController],
  providers: [PassengerService, PassengerRepository, PassengerModuleValidator],
  exports: [PassengerService],
})
export class PassengerModule {}
