import { type ExecutionContext, UnauthorizedException } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";

import type { AuthenticatedRequest } from "../interfaces/authenticated-request.interface";
import { JwtAccessGuard } from "./jwt-access.guard";

describe("JwtAccessGuard", () => {
  const secret = "test-access-secret";
  const jwtService = new JwtService({ secret });
  const reflector = { getAllAndOverride: () => false } as unknown as Reflector;
  const guard = new JwtAccessGuard(reflector, jwtService);

  function contextFor(authorization?: string): {
    context: ExecutionContext;
    request: AuthenticatedRequest;
  } {
    const request = { headers: { authorization } } as unknown as AuthenticatedRequest;
    const context = {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    return { context, request };
  }

  it("accepts a valid access token and exposes its principal", async () => {
    const token = await jwtService.signAsync({ sub: "user-1" }, { expiresIn: "5m" });
    const { context, request } = contextFor(`Bearer ${token}`);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual(expect.objectContaining({ sub: "user-1" }));
  });

  it("answers an expired access token with a 401, not a 500", async () => {
    const issuedAt = Math.floor(Date.now() / 1000) - 120;
    const token = await jwtService.signAsync({ sub: "user-1", iat: issuedAt, exp: issuedAt + 60 });
    const { context } = contextFor(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("answers a malformed or foreign-signed token with a 401", async () => {
    const foreign = await new JwtService({ secret: "another-secret" }).signAsync({ sub: "x" });

    await expect(guard.canActivate(contextFor("Bearer not.a.jwt").context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(guard.canActivate(contextFor(`Bearer ${foreign}`).context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("still refuses a request with no bearer token", async () => {
    await expect(guard.canActivate(contextFor(undefined).context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
