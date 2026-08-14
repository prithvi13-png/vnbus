import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { SupplierAdapterDto } from "../dto/supplier-adapter.dto";
import { SupplierSummaryDto } from "../dto/supplier-summary.dto";
import { SupplierRegistryService } from "../services/supplier-registry.service";
import { SupplierService } from "../services/supplier.service";

@ApiTags("Supplier")
@ApiBearerAuth()
@Controller("supplier")
export class SupplierController {
  constructor(
    private readonly service: SupplierService,
    private readonly registry: SupplierRegistryService,
  ) {}

  @Public()
  @Get("health")
  getHealth(): SupplierSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("capabilities")
  getCapabilities(): SupplierSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("adapters")
  getAdapters(): SupplierAdapterDto[] {
    return this.registry
      .listAdapters()
      .map((adapter) => new SupplierAdapterDto(adapter.code, "PENDING_INTEGRATION"));
  }
}
