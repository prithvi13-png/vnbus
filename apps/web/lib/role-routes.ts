import { ADMIN_ROLE, CUSTOMER_ROLE, TRAVEL_AGENT_ROLE } from "@vnbus/shared";
import type { UserRole } from "@vnbus/types";

import type { AuthUser } from "./auth-store";

export function userHasRole(user: AuthUser, role: UserRole): boolean {
  return user.role === role || user.roles.includes(role);
}

export function isAdminUser(user: AuthUser): boolean {
  return userHasRole(user, ADMIN_ROLE);
}

export function isCustomerUser(user: AuthUser): boolean {
  return userHasRole(user, CUSTOMER_ROLE);
}

export function isTravelAgentUser(user: AuthUser): boolean {
  return userHasRole(user, TRAVEL_AGENT_ROLE);
}

export function getDashboardPathForUser(user: AuthUser): string {
  if (isAdminUser(user)) {
    return "/admin/dashboard";
  }

  if (isTravelAgentUser(user)) {
    return "/agent/dashboard";
  }

  if (isCustomerUser(user)) {
    return "/customer/dashboard";
  }

  return "/unauthorized";
}

export function getPostLoginPathForUser(
  user: AuthUser,
  redirect: string | null | undefined,
): string {
  if (redirect?.startsWith("/") && !redirect.startsWith("//")) {
    if (redirect === "/dashboard") {
      return getDashboardPathForUser(user);
    }

    if (redirect.startsWith("/admin")) {
      return isAdminUser(user) ? redirect : "/unauthorized";
    }

    if (redirect.startsWith("/agent")) {
      return isTravelAgentUser(user) ? redirect : "/unauthorized";
    }

    if (redirect.startsWith("/customer")) {
      return isCustomerUser(user) ? redirect : "/unauthorized";
    }

    return redirect;
  }

  return getDashboardPathForUser(user);
}
