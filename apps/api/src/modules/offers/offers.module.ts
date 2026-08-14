import { Module } from "@nestjs/common";

import { OffersController } from "./controllers/offers.controller";
import { OffersRepository } from "./repositories/offers.repository";
import { OffersService } from "./services/offers.service";
import { OffersModuleValidator } from "./validators/offers.validator";

@Module({
  controllers: [OffersController],
  providers: [OffersService, OffersRepository, OffersModuleValidator],
  exports: [OffersService],
})
export class OffersModule {}
