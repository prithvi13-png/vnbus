import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";

import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import type { AuthenticatedRequest } from "../interfaces/authenticated-request.interface";
import type { JwtPrincipal } from "../interfaces/jwt-principal.interface";

@Injectable()
export class JwtAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer access token");
    }

    const token = authorization.slice("Bearer ".length);

    // verifyAsync throws jsonwebtoken's own errors, which are not HTTP errors
    // and would otherwise reach clients as a 500. An expired or invalid token
    // is a 401 — the signal the web app uses to renew the session.
    try {
      request.user = await this.jwtService.verifyAsync<JwtPrincipal>(token);
    } catch {
      throw new UnauthorizedException("Access token is invalid or expired");
    }

    return true;
  }
}
