import { UnauthorizedException } from "@nestjs/common";

import type { AuthenticatedRequest } from "./interfaces/authenticated-request.interface";
import type { JwtPrincipal } from "./interfaces/jwt-principal.interface";

/**
 * The signed-in user behind a request. The global JWT guard has already run on
 * every non-public route, so a missing principal means a route was wired as
 * public by mistake; refusing here keeps that from exposing someone's data.
 */
export function requirePrincipal(request: AuthenticatedRequest): JwtPrincipal {
  if (!request.user?.sub) {
    throw new UnauthorizedException("Sign in to continue");
  }

  return request.user;
}

export function requireUserId(request: AuthenticatedRequest): string {
  return requirePrincipal(request).sub;
}

export function isAdmin(principal: JwtPrincipal): boolean {
  return principal.roles.includes("ADMIN");
}
