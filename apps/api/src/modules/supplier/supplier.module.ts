import { Module } from "@nestjs/common";

import { SupplierController } from "./controllers/supplier.controller";
import { SupplierRepository } from "./repositories/supplier.repository";
import { SupplierRegistryService } from "./services/supplier-registry.service";
import { SupplierService } from "./services/supplier.service";
import { SupplierModuleValidator } from "./validators/supplier.validator";

@Module({
  controllers: [SupplierController],
  providers: [
    SupplierService,
    SupplierRepository,
    SupplierModuleValidator,
    SupplierRegistryService,
  ],
  exports: [SupplierService, SupplierRegistryService],
})
export class SupplierModule {}
