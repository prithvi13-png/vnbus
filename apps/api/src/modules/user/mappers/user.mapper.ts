import type { Prisma } from "@prisma/client";
import type { UserRole } from "@vnbus/types";

import type { UserDto } from "../dto/user.dto";
import { UserEntity } from "../entities/user.entity";

type UserWithAccess = Prisma.UserGetPayload<{
  include: {
    role: {
      include: {
        permissions: {
          include: {
            permission: true;
          };
        };
      };
    };
    roles: {
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export class UserMapper {
  static toEntity(user: UserWithAccess): UserEntity {
    const assignedRoles = user.roles.map((assignment) => assignment.role.code);
    const roles = Array.from(new Set([user.role.code, ...assignedRoles])) as UserRole[];
    const permissionCodes = [
      ...user.role.permissions.map((rolePermission) => rolePermission.permission.code),
      ...user.roles.flatMap((assignment) =>
        assignment.role.permissions.map((rolePermission) => rolePermission.permission.code),
      ),
    ];

    return new UserEntity(
      user.id,
      user.firstName,
      user.lastName,
      user.email,
      user.phone,
      user.avatar,
      user.role.code,
      roles,
      Array.from(new Set(permissionCodes)),
      user.status,
      user.emailVerified,
      user.forcePasswordChange,
      user.lastLoginAt,
      user.createdAt,
      user.updatedAt,
      user.deletedAt,
    );
  }

  static toDto(entity: UserEntity): UserDto {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      phone: entity.phone,
      avatar: entity.avatar,
      role: entity.role,
      roles: entity.roles,
      permissions: entity.permissions,
      status: entity.status,
      emailVerified: entity.emailVerified,
      forcePasswordChange: entity.forcePasswordChange,
      lastLoginAt: entity.lastLoginAt?.toISOString() ?? null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      deletedAt: entity.deletedAt?.toISOString() ?? null,
    };
  }
}
