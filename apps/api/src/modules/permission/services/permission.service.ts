import { Injectable } from "@nestjs/common";

import { PermissionDto } from "../dto/permission.dto";
import { PermissionMapper } from "../mappers/permission.mapper";
import { PermissionRepository } from "../repositories/permission.repository";

@Injectable()
export class PermissionService {
  constructor(private readonly repository: PermissionRepository) {}

  async list(): Promise<PermissionDto[]> {
    const permissions = await this.repository.findMany();

    return permissions.map((permission) =>
      PermissionMapper.toDto(PermissionMapper.toEntity(permission)),
    );
  }
}
