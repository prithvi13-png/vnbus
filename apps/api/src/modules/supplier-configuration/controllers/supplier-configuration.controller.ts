import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { AdminSupplierConfigurationRecord } from "@vnbus/types";

import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { UpdateSupplierConfigurationDto } from "../dto/supplier-configuration.dto";
import { SupplierConfigurationService } from "../services/supplier-configuration.service";

@ApiTags("Supplier Configuration")
@ApiBearerAuth()
@Controller("supplier-configurations")
export class SupplierConfigurationController {
  constructor(private readonly service: SupplierConfigurationService) {}

  @Roles("ADMIN")
  @Get()
  @ApiOkResponse({ description: "Architecture-only supplier configuration placeholders" })
  list(): AdminSupplierConfigurationRecord[] {
    return this.service.list();
  }

  @Roles("ADMIN")
  @Patch(":supplierId")
  @ApiOkResponse({
    description: "Update supplier placeholder enablement, priority, or environment",
  })
  update(
    @Param("supplierId") supplierId: string,
    @Body() dto: UpdateSupplierConfigurationDto,
  ): AdminSupplierConfigurationRecord {
    return this.service.update(supplierId, dto);
  }
}
