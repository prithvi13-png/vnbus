import { Module } from "@nestjs/common";

import { IntegrationModule } from "../integration/integration.module";
import { SupplierConfigurationController } from "./controllers/supplier-configuration.controller";
import { SupplierConfigurationRepository } from "./repositories/supplier-configuration.repository";
import { SupplierConfigurationService } from "./services/supplier-configuration.service";
import { SupplierConfigurationValidator } from "./validators/supplier-configuration.validator";

@Module({
  imports: [IntegrationModule],
  controllers: [SupplierConfigurationController],
  providers: [
    SupplierConfigurationService,
    SupplierConfigurationRepository,
    SupplierConfigurationValidator,
  ],
  exports: [SupplierConfigurationService],
})
export class SupplierConfigurationModule {}
