import { Body, Controller, Get, Param, Patch, Post, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { Permissions } from "../../../shared/security/decorators/permissions.decorator";
import { CreateRoleDto, UpdateRoleDto, UpdateRolePermissionsDto } from "../dto/admin-role.dto";
import { RoleDto } from "../dto/role.dto";
import { RoleService } from "../services/role.service";

@ApiTags("Roles")
@ApiBearerAuth()
@Controller("roles")
export class RoleController {
  constructor(private readonly service: RoleService) {}

  @Permissions("roles.view")
  @Get()
  list(): Promise<RoleDto[]> {
    return this.service.list();
  }

  @Permissions("roles.view")
  @Get(":code")
  getByCode(@Param("code") code: string): Promise<RoleDto> {
    return this.service.getByCode(code);
  }

  @Permissions("roles.manage")
  @Post()
  @ApiOkResponse({ description: "Create future-ready dynamic role" })
  create(@Body() dto: CreateRoleDto): Promise<RoleDto> {
    return this.service.create(dto);
  }

  @Permissions("roles.manage")
  @Patch(":code")
  @ApiOkResponse({ description: "Update dynamic role metadata" })
  update(@Param("code") code: string, @Body() dto: UpdateRoleDto): Promise<RoleDto> {
    return this.service.update(code, dto);
  }

  @Permissions("roles.manage")
  @Put(":code/permissions")
  @ApiOkResponse({ description: "Replace assigned permissions for a role" })
  replacePermissions(
    @Param("code") code: string,
    @Body() dto: UpdateRolePermissionsDto,
  ): Promise<RoleDto> {
    return this.service.replacePermissions(code, dto);
  }

  @Permissions("roles.manage")
  @Post(":code/permissions")
  @ApiOkResponse({ description: "Assign permissions to a role" })
  assignPermissions(
    @Param("code") code: string,
    @Body() dto: UpdateRolePermissionsDto,
  ): Promise<RoleDto> {
    return this.service.assignPermissions(code, dto);
  }

  @Permissions("roles.manage")
  @Post(":code/permissions/remove")
  @ApiOkResponse({ description: "Remove permissions from a role" })
  removePermissions(
    @Param("code") code: string,
    @Body() dto: UpdateRolePermissionsDto,
  ): Promise<RoleDto> {
    return this.service.removePermissions(code, dto);
  }
}
