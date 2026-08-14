import type { Permission } from "@prisma/client";

import type { PermissionDto } from "../dto/permission.dto";
import { PermissionEntity } from "../entities/permission.entity";

export class PermissionMapper {
  static toEntity(permission: Permission): PermissionEntity {
    return new PermissionEntity(permission.id, permission.code, permission.description);
  }

  static toDto(entity: PermissionEntity): PermissionDto {
    return {
      id: entity.id,
      code: entity.code,
      description: entity.description,
    };
  }
}
