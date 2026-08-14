import { randomUUID } from "node:crypto";

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { ActivityService } from "../../activity/services/activity.service";
import { EmailTemplateService } from "../../../shared/email/email-template.service";
import type { RequestContext } from "../../../shared/http/request-context";
import { durationToMilliseconds, durationToSeconds } from "../../../shared/utils/duration";
import { ChangePasswordDto } from "../dto/change-password.dto";
import type { LoginDto } from "../dto/login.dto";
import type { RegisterCustomerDto } from "../dto/register-customer.dto";
import type { ResetPasswordDto } from "../dto/reset-password.dto";
import type { AuthenticatedUserRecord } from "../interfaces/authenticated-user-record.interface";
import type {
  AuthResponse,
  PasswordRequestAcknowledgement,
} from "../interfaces/auth-response.interface";
import { AuthMapper } from "../mappers/auth.mapper";
import { AuthRepository } from "../repositories/auth.repository";
import { PasswordService } from "./password.service";

interface RefreshPayload {
  sub: string;
  email: string;
  jti: string;
}

interface IssuedAuthTokens {
  response: AuthResponse;
  refreshTokenId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly config: ConfigService,
    private readonly email: EmailTemplateService,
    private readonly activity: ActivityService,
  ) {}

  async registerCustomer(
    dto: RegisterCustomerDto,
    context?: RequestContext,
  ): Promise<AuthResponse> {
    const email = dto.email.toLowerCase();
    const existing = await this.repository.findByEmail(email);

    if (existing) {
      throw new ConflictException("Email is already registered");
    }

    const passwordHash = await this.passwordService.hashPassword(dto.password);
    const user = await this.repository.createCustomerAccount({ ...dto, email }, passwordHash);
    const verificationToken = await this.prepareEmailVerification(user.id, context);

    await this.email.queue({
      to: user.email,
      templateKey: "welcome",
      variables: { firstName: user.firstName },
    });
    await this.email.queue({
      to: user.email,
      templateKey: "verify-email",
      variables: {
        verificationUrl: `${this.config.getOrThrow<string>("APP_URL")}/verify-email?token=${verificationToken}`,
      },
    });
    await this.activity.record({
      actorType: "USER",
      actorUserId: user.id,
      action: "auth.register",
      message: "Customer registered",
      entityType: "user",
      entityId: user.id,
      ...context,
    });

    return (await this.issueTokens(user, context)).response;
  }

  async login(dto: LoginDto, context?: RequestContext): Promise<AuthResponse> {
    const user = await this.repository.findByEmail(dto.email.toLowerCase());

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
      throw new UnauthorizedException("Account is not active");
    }

    const passwordMatches = await this.passwordService.verifyPassword(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      await this.activity.record({
        actorType: "USER",
        actorUserId: user.id,
        action: "auth.login_failed",
        message: "Invalid password attempt",
        entityType: "user",
        entityId: user.id,
        ...context,
      });
      throw new UnauthorizedException("Invalid email or password");
    }

    await this.repository.updateLastLogin(user.id);
    await this.activity.record({
      actorType: "USER",
      actorUserId: user.id,
      action: "auth.login",
      message: "User logged in",
      entityType: "user",
      entityId: user.id,
      ...context,
    });

    return (await this.issueTokens(user, context)).response;
  }

  async refresh(refreshToken: string, context?: RequestContext): Promise<AuthResponse> {
    const payload = await this.jwtService.verifyAsync<RefreshPayload>(refreshToken, {
      secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
    });
    const storedToken = await this.repository.findRefreshToken(payload.jti);

    if (!storedToken || storedToken.expiresAt <= new Date()) {
      throw new UnauthorizedException("Refresh token is invalid or expired");
    }

    if (storedToken.revokedAt) {
      await this.repository.revokeRefreshTokenFamily(storedToken.tokenFamily);
      throw new UnauthorizedException("Refresh token reuse detected");
    }

    const tokenHash = this.passwordService.hashToken(refreshToken);

    if (!this.passwordService.tokensEqual(tokenHash, storedToken.tokenHash)) {
      await this.repository.revokeRefreshTokenFamily(storedToken.tokenFamily);
      throw new UnauthorizedException("Refresh token is invalid or expired");
    }

    const user = await this.repository.findById(storedToken.userId);

    if (!user) {
      throw new UnauthorizedException("User no longer exists");
    }

    const issued = await this.issueTokens(user, context, storedToken.tokenFamily);
    await this.repository.rotateRefreshToken(payload.jti, issued.refreshTokenId);

    return issued.response;
  }

  async logout(refreshToken?: string): Promise<PasswordRequestAcknowledgement> {
    if (refreshToken) {
      try {
        const payload = await this.jwtService.verifyAsync<RefreshPayload>(refreshToken, {
          secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
        });
        await this.repository.revokeRefreshToken(payload.jti);
      } catch {
        // Logout is intentionally idempotent; invalid tokens still clear client state.
      }
    }

    return {
      accepted: true,
      message: "Logged out",
    };
  }

  async requestPasswordReset(
    email: string,
    context?: RequestContext,
  ): Promise<PasswordRequestAcknowledgement> {
    const user = await this.repository.findByEmail(email.toLowerCase());

    if (user) {
      const token = this.passwordService.createSecureToken();
      const tokenHash = this.passwordService.hashToken(token);
      const ttlMinutes = this.config.getOrThrow<number>("PASSWORD_RESET_TTL_MINUTES");
      const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
      await this.repository.createPasswordReset(user.id, tokenHash, expiresAt, context);
      await this.email.queue({
        to: user.email,
        templateKey: "forgot-password",
        variables: {
          resetUrl: `${this.config.getOrThrow<string>("APP_URL")}/reset-password?token=${token}`,
        },
      });
    }

    return {
      accepted: true,
      message: "If the account exists, a reset email will be queued.",
    };
  }

  async resetPassword(
    dto: ResetPasswordDto,
    context?: RequestContext,
  ): Promise<PasswordRequestAcknowledgement> {
    const tokenHash = this.passwordService.hashToken(dto.token);
    const passwordHash = await this.passwordService.hashPassword(dto.password);
    const consumed = await this.repository.consumePasswordReset(tokenHash, passwordHash);

    if (!consumed) {
      throw new UnprocessableEntityException("Password reset token is invalid or expired");
    }

    await this.activity.record({
      actorType: "SYSTEM",
      action: "auth.password_reset",
      message: "Password reset completed",
      entityType: "user",
      ...context,
    });

    return {
      accepted: true,
      message: "Password reset completed",
    };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    context?: RequestContext,
  ): Promise<PasswordRequestAcknowledgement> {
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new UnauthorizedException("User no longer exists");
    }

    const passwordMatches = await this.passwordService.verifyPassword(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const passwordHash = await this.passwordService.hashPassword(dto.newPassword);
    await this.repository.updatePassword(user.id, passwordHash);
    await this.email.queue({
      to: user.email,
      templateKey: "password-changed",
      variables: {},
    });
    await this.activity.record({
      actorType: "USER",
      actorUserId: user.id,
      action: "auth.password_changed",
      message: "Password changed",
      entityType: "user",
      entityId: user.id,
      ...context,
    });

    return {
      accepted: true,
      message: "Password changed",
    };
  }

  async verifyEmail(
    token: string,
    context?: RequestContext,
  ): Promise<PasswordRequestAcknowledgement> {
    const tokenHash = this.passwordService.hashToken(token);
    const consumed = await this.repository.consumeEmailVerification(tokenHash);

    if (!consumed) {
      throw new UnprocessableEntityException("Email verification token is invalid or expired");
    }

    await this.activity.record({
      actorType: "SYSTEM",
      action: "auth.email_verified",
      message: "Email verified",
      entityType: "user",
      ...context,
    });

    return {
      accepted: true,
      message: "Email verified",
    };
  }

  private async prepareEmailVerification(
    userId: string,
    context?: RequestContext,
  ): Promise<string> {
    const token = this.passwordService.createSecureToken();
    const tokenHash = this.passwordService.hashToken(token);
    const ttlHours = this.config.getOrThrow<number>("EMAIL_VERIFICATION_TTL_HOURS");
    const expiresAt = new Date(Date.now() + ttlHours * 3_600_000);

    await this.repository.createEmailVerification(userId, tokenHash, expiresAt, context);

    return token;
  }

  private async issueTokens(
    user: AuthenticatedUserRecord,
    context?: RequestContext,
    tokenFamily: string = randomUUID(),
  ): Promise<IssuedAuthTokens> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
    });
    const refreshTokenId = randomUUID();
    const refreshExpiresAt = new Date(Date.now() + this.getRefreshTtlMs());
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        jti: refreshTokenId,
      },
      {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.getRefreshTtlSeconds(),
      },
    );

    await this.repository.persistRefreshToken(
      user.id,
      refreshTokenId,
      tokenFamily,
      this.passwordService.hashToken(refreshToken),
      refreshExpiresAt,
      context,
    );

    return {
      refreshTokenId,
      response: {
        user: AuthMapper.toProfile(user),
        accessToken,
        refreshToken,
      },
    };
  }

  private getRefreshTtlMs(): number {
    return durationToMilliseconds(
      this.config.getOrThrow<string>("JWT_REFRESH_TTL"),
      7 * 86_400_000,
    );
  }

  private getRefreshTtlSeconds(): number {
    return durationToSeconds(this.config.getOrThrow<string>("JWT_REFRESH_TTL"), 7 * 86_400);
  }
}
