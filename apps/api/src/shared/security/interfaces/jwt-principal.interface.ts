import type { UserRole } from "@vnbus/types";

export interface JwtPrincipal {
  sub: string;
  email: string;
  roles: UserRole[];
  permissions: string[];
}
