import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import type { AuthenticatedRequest } from "../interfaces/authenticated-request.interface";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userPermissions = request.user?.permissions ?? [];
    const isAllowed = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!isAllowed) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
