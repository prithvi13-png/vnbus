import { Module } from "@nestjs/common";

import { CouponsController } from "./controllers/coupons.controller";
import { CouponsRepository } from "./repositories/coupons.repository";
import { CouponsService } from "./services/coupons.service";
import { CouponsModuleValidator } from "./validators/coupons.validator";

@Module({
  controllers: [CouponsController],
  providers: [CouponsService, CouponsRepository, CouponsModuleValidator],
  exports: [CouponsService],
})
export class CouponsModule {}
