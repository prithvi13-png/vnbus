import type {
  ChangePasswordFormValues,
  ForgotPasswordFormValues,
  LoginFormValues,
  ProfileFormValues,
  RegisterFormValues,
  ResetPasswordFormValues,
  VerifyEmailFormValues,
} from "./auth-schemas";
import type { AuthResponse, AuthUser } from "./auth-store";
import { apiClient } from "./api-client";

export interface Acknowledgement {
  accepted: true;
  message: string;
}

export function login(values: LoginFormValues): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function registerCustomer(values: RegisterFormValues): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function requestPasswordReset(values: ForgotPasswordFormValues): Promise<Acknowledgement> {
  return apiClient<Acknowledgement>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function resetPassword(values: ResetPasswordFormValues): Promise<Acknowledgement> {
  return apiClient<Acknowledgement>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function verifyEmail(values: VerifyEmailFormValues): Promise<Acknowledgement> {
  return apiClient<Acknowledgement>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function changePassword(
  values: ChangePasswordFormValues,
  accessToken: string,
): Promise<Acknowledgement> {
  return apiClient<Acknowledgement>("/auth/change-password", {
    method: "POST",
    headers: buildAuthHeaders(accessToken),
    body: JSON.stringify(values),
  });
}

export function updateProfile(values: ProfileFormValues, accessToken: string): Promise<AuthUser> {
  return apiClient<AuthUser>("/users/profile", {
    method: "PATCH",
    headers: buildAuthHeaders(accessToken),
    body: JSON.stringify(values),
  });
}

export function logout(accessToken: string | null): Promise<Acknowledgement> {
  return apiClient<Acknowledgement>("/auth/logout", {
    method: "POST",
    ...(accessToken ? { headers: buildAuthHeaders(accessToken) } : {}),
    body: JSON.stringify({}),
  });
}

function buildAuthHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}
