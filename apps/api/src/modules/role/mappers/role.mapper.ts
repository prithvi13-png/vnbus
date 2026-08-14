import type { Prisma } from "@prisma/client";

import type { RoleDto } from "../dto/role.dto";
import { RoleEntity } from "../entities/role.entity";

type RoleWithPermissions = Prisma.RoleGetPayload<{
  include: {
    permissions: {
      include: {
        permission: true;
      };
    };
  };
}>;

export class RoleMapper {
  static toEntity(role: RoleWithPermissions): RoleEntity {
    return new RoleEntity(
      role.id,
      role.code,
      role.name,
      role.description,
      role.isSystem,
      role.permissions.map((rolePermission) => rolePermission.permission.code),
    );
  }

  static toDto(entity: RoleEntity): RoleDto {
    return {
      id: entity.id,
      code: entity.code,
      name: entity.name,
      description: entity.description,
      isSystem: entity.isSystem,
      permissions: entity.permissions,
    };
  }
}
