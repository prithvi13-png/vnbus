import type { UserRole } from "@vnbus/types";

export class AuthenticatedUserEntity {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly roles: UserRole[],
    readonly permissions: string[],
  ) {}
}
