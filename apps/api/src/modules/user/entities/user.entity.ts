import type { UserStatus } from "@prisma/client";
import type { UserRole } from "@vnbus/types";

export class UserEntity {
  constructor(
    readonly id: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly email: string,
    readonly phone: string,
    readonly avatar: string | null,
    readonly role: UserRole,
    readonly roles: UserRole[],
    readonly permissions: string[],
    readonly status: UserStatus,
    readonly emailVerified: boolean,
    readonly forcePasswordChange: boolean,
    readonly lastLoginAt: Date | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly deletedAt: Date | null,
  ) {}
}
