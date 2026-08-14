import { Injectable, NotFoundException } from "@nestjs/common";

import type { CreateRoleDto, UpdateRoleDto, UpdateRolePermissionsDto } from "../dto/admin-role.dto";
import { RoleDto } from "../dto/role.dto";
import { RoleMapper } from "../mappers/role.mapper";
import { RoleRepository } from "../repositories/role.repository";
import { RoleValidator } from "../validators/role.validator";

@Injectable()
export class RoleService {
  constructor(
    private readonly repository: RoleRepository,
    private readonly validator: RoleValidator,
  ) {}

  async list(): Promise<RoleDto[]> {
    const roles = await this.repository.findMany();

    return roles.map((role) => RoleMapper.toDto(RoleMapper.toEntity(role)));
  }

  async getByCode(code: string): Promise<RoleDto> {
    const role = await this.repository.findByCode(code);

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    return RoleMapper.toDto(RoleMapper.toEntity(role));
  }

  async create(dto: CreateRoleDto): Promise<RoleDto> {
    this.validator.ensureRoleCode(dto.code);
    const role = await this.repository.create(dto);

    return RoleMapper.toDto(RoleMapper.toEntity(role));
  }

  async update(code: string, dto: UpdateRoleDto): Promise<RoleDto> {
    const role = await this.repository.update(code, dto);

    return RoleMapper.toDto(RoleMapper.toEntity(role));
  }

  async replacePermissions(code: string, dto: UpdateRolePermissionsDto): Promise<RoleDto> {
    const role = await this.repository.replacePermissions(code, dto.permissionCodes);

    return RoleMapper.toDto(RoleMapper.toEntity(role));
  }

  async assignPermissions(code: string, dto: UpdateRolePermissionsDto): Promise<RoleDto> {
    const role = await this.repository.assignPermissions(code, dto.permissionCodes);

    return RoleMapper.toDto(RoleMapper.toEntity(role));
  }

  async removePermissions(code: string, dto: UpdateRolePermissionsDto): Promise<RoleDto> {
    const role = await this.repository.removePermissions(code, dto.permissionCodes);

    return RoleMapper.toDto(RoleMapper.toEntity(role));
  }
}
