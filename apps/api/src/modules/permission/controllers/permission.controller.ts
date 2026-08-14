import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { Permissions } from "../../../shared/security/decorators/permissions.decorator";
import { PermissionDto } from "../dto/permission.dto";
import { PermissionService } from "../services/permission.service";

@ApiTags("Permissions")
@ApiBearerAuth()
@Controller("permissions")
export class PermissionController {
  constructor(private readonly service: PermissionService) {}

  @Permissions("permissions.view")
  @Get()
  list(): Promise<PermissionDto[]> {
    return this.service.list();
  }
}
