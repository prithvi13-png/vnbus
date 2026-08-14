import type { AuthenticatedUserRecord } from "../interfaces/authenticated-user-record.interface";
import type { AuthenticatedProfile } from "../interfaces/auth-response.interface";

export class AuthMapper {
  static toProfile(user: AuthenticatedUserRecord): AuthenticatedProfile {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      roles: user.roles,
      permissions: user.permissions,
      status: user.status,
      emailVerified: user.emailVerified,
      forcePasswordChange: user.forcePasswordChange,
    };
  }
}
