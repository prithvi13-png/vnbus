import type { UserRole } from "@vnbus/types";

export interface AuthenticatedProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: UserRole;
  roles: UserRole[];
  permissions: string[];
  status: string;
  emailVerified: boolean;
  forcePasswordChange: boolean;
}

export interface AuthResponse {
  user: AuthenticatedProfile;
  accessToken: string;
  refreshToken: string;
}

export interface PasswordRequestAcknowledgement {
  accepted: true;
  message: string;
}
