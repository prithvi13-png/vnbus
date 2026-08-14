import type { Prisma } from "@prisma/client";
import type { UserRole } from "@vnbus/types";

import type { ProfileDto } from "../dto/profile.dto";
import { ProfileEntity } from "../entities/profile.entity";

type ProfileWithAccess = Prisma.UserGetPayload<{
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

export class ProfileMapper {
  static toEntity(user: ProfileWithAccess): ProfileEntity {
    const assignedRoles = user.roles.map((assignment) => assignment.role.code);
    const roles = Array.from(new Set([user.role.code, ...assignedRoles])) as UserRole[];
    const permissionCodes = [
      ...user.role.permissions.map((rolePermission) => rolePermission.permission.code),
      ...user.roles.flatMap((assignment) =>
        assignment.role.permissions.map((rolePermission) => rolePermission.permission.code),
      ),
    ];

    return new ProfileEntity(
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
    );
  }

  static toDto(entity: ProfileEntity): ProfileDto {
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
    };
  }
}
