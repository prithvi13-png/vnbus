import { randomUUID } from "node:crypto";

import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Response } from "express";

import { getRequestContext } from "../../../shared/http/request-context";
import { Public } from "../../../shared/security/decorators/public.decorator";
import type { AuthenticatedRequest } from "../../../shared/security/interfaces/authenticated-request.interface";
import { durationToMilliseconds } from "../../../shared/utils/duration";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { ForgotPasswordDto } from "../dto/forgot-password.dto";
import { LoginDto } from "../dto/login.dto";
import { LogoutDto } from "../dto/logout.dto";
import { RefreshTokenDto } from "../dto/refresh-token.dto";
import { RegisterCustomerDto } from "../dto/register-customer.dto";
import { ResetPasswordDto } from "../dto/reset-password.dto";
import { VerifyEmailDto } from "../dto/verify-email.dto";
import type {
  AuthResponse,
  PasswordRequestAcknowledgement,
} from "../interfaces/auth-response.interface";
import { AuthService } from "../services/auth.service";

const refreshCookieName = "vn_refresh_token";
const csrfCookieName = "vn_csrf";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post("register")
  async register(
    @Body() dto: RegisterCustomerDto,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const authResponse = await this.authService.registerCustomer(dto, getRequestContext(request));
    this.setSessionCookies(response, authResponse.refreshToken);

    return authResponse;
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const authResponse = await this.authService.login(dto, getRequestContext(request));
    this.setSessionCookies(response, authResponse.refreshToken);

    return authResponse;
  }

  @Public()
  @Post("logout")
  async logout(
    @Body() dto: LogoutDto,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PasswordRequestAcknowledgement> {
    const acknowledgement = await this.authService.logout(
      dto.refreshToken ?? this.getCookie(request, refreshCookieName),
    );
    this.clearSessionCookies(response);

    return acknowledgement;
  }

  @Public()
  @Post("refresh")
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const refreshToken = dto.refreshToken ?? this.getCookie(request, refreshCookieName);

    if (!refreshToken) {
      throw new UnauthorizedException("Missing refresh token");
    }

    const authResponse = await this.authService.refresh(refreshToken, getRequestContext(request));
    this.setSessionCookies(response, authResponse.refreshToken);

    return authResponse;
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post("forgot-password")
  forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<PasswordRequestAcknowledgement> {
    return this.authService.requestPasswordReset(dto.email, getRequestContext(request));
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post("reset-password")
  resetPassword(
    @Body() dto: ResetPasswordDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<PasswordRequestAcknowledgement> {
    return this.authService.resetPassword(dto, getRequestContext(request));
  }

  @ApiBearerAuth()
  @Post("change-password")
  changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<PasswordRequestAcknowledgement> {
    if (!request.user?.sub) {
      throw new UnauthorizedException("Missing authenticated user");
    }

    return this.authService.changePassword(request.user.sub, dto, getRequestContext(request));
  }

  @Public()
  @Post("verify-email")
  verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<PasswordRequestAcknowledgement> {
    return this.authService.verifyEmail(dto.token, getRequestContext(request));
  }

  @ApiBearerAuth()
  @Get("me")
  me(@Req() request: AuthenticatedRequest): AuthenticatedRequest["user"] {
    return request.user;
  }

  private setSessionCookies(response: Response, refreshToken: string): void {
    const isProduction = this.config.get<string>("NODE_ENV") === "production";
    const maxAge = durationToMilliseconds(
      this.config.getOrThrow<string>("JWT_REFRESH_TTL"),
      7 * 86_400_000,
    );

    response.cookie(refreshCookieName, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/api/v1/auth",
      maxAge,
    });
    response.cookie(csrfCookieName, randomUUID(), {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge,
    });
  }

  private clearSessionCookies(response: Response): void {
    response.clearCookie(refreshCookieName, {
      path: "/api/v1/auth",
    });
    response.clearCookie(csrfCookieName, {
      path: "/",
    });
  }

  private getCookie(request: AuthenticatedRequest, name: string): string | undefined {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return undefined;
    }

    return cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${name}=`))
      ?.slice(name.length + 1);
  }
}
