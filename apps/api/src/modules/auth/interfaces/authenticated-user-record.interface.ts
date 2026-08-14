import type { UserRole } from "@vnbus/types";

export interface AuthenticatedUserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string | null;
  passwordHash: string;
  role: UserRole;
  roles: UserRole[];
  permissions: string[];
  status: string;
  emailVerified: boolean;
  forcePasswordChange: boolean;
}
