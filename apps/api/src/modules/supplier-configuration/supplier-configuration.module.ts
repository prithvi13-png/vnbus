import { Module } from "@nestjs/common";

import { SupplierConfigurationController } from "./controllers/supplier-configuration.controller";
import { SupplierConfigurationRepository } from "./repositories/supplier-configuration.repository";
import { SupplierConfigurationService } from "./services/supplier-configuration.service";
import { SupplierConfigurationValidator } from "./validators/supplier-configuration.validator";

@Module({
  controllers: [SupplierConfigurationController],
  providers: [
    SupplierConfigurationService,
    SupplierConfigurationRepository,
    SupplierConfigurationValidator,
  ],
  exports: [SupplierConfigurationService],
})
export class SupplierConfigurationModule {}
