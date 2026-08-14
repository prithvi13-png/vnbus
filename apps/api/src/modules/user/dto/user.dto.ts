import type { UserStatus } from "@prisma/client";
import type { UserRole } from "@vnbus/types";

export class UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: UserRole;
  roles: UserRole[];
  permissions: string[];
  status: UserStatus;
  emailVerified: boolean;
  forcePasswordChange: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
