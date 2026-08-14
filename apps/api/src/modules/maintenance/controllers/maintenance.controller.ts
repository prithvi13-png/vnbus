import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { MaintenanceModeStatus } from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { UpdateMaintenanceModeDto } from "../dto/maintenance.dto";
import { MaintenanceService } from "../services/maintenance.service";

@ApiTags("Maintenance")
@Controller("maintenance")
export class MaintenanceController {
  constructor(private readonly service: MaintenanceService) {}

  @Public()
  @Get()
  @ApiOkResponse({ description: "Current maintenance mode status" })
  getStatus(): MaintenanceModeStatus {
    return this.service.getStatus();
  }

  @ApiBearerAuth()
  @Roles("ADMIN")
  @Patch()
  @ApiOkResponse({ description: "Enable or disable customer-facing maintenance mode" })
  update(@Body() dto: UpdateMaintenanceModeDto): MaintenanceModeStatus {
    return this.service.update(dto);
  }
}
