import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import type { RequestContext } from "../../../shared/http/request-context";
import { PrismaService } from "../../../shared/prisma/prisma.service";
import type { RegisterCustomerDto } from "../dto/register-customer.dto";
import type { AuthenticatedUserRecord } from "../interfaces/authenticated-user-record.interface";

const rolePermissionInclude = {
  permissions: {
    include: {
      permission: true,
    },
  },
} satisfies Prisma.RoleInclude;

const userAccessInclude = {
  role: {
    include: rolePermissionInclude,
  },
  roles: {
    include: {
      role: {
        include: rolePermissionInclude,
      },
    },
  },
} satisfies Prisma.UserInclude;

type UserWithAccess = Prisma.UserGetPayload<{ include: typeof userAccessInclude }>;

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<AuthenticatedUserRecord | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      include: userAccessInclude,
    });

    return user ? this.toAuthenticatedRecord(user) : null;
  }

  async findById(id: string): Promise<AuthenticatedUserRecord | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: userAccessInclude,
    });

    return user ? this.toAuthenticatedRecord(user) : null;
  }

  async createCustomerAccount(
    dto: RegisterCustomerDto,
    passwordHash: string,
  ): Promise<AuthenticatedUserRecord> {
    const user = await this.prisma.$transaction(async (transaction) => {
      const role = await transaction.role.upsert({
        where: { code: "CUSTOMER" },
        create: {
          code: "CUSTOMER",
          name: "Customer",
          description: "Direct traveller account",
          isSystem: true,
        },
        update: {},
      });

      return transaction.user.create({
        data: {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          email: dto.email.toLowerCase(),
          phone: dto.phone,
          passwordHash,
          roleId: role.id,
          status: "PENDING_VERIFICATION",
          customer: {
            create: {
              fullName: `${dto.firstName.trim()} ${dto.lastName.trim()}`,
              phone: dto.phone,
            },
          },
          roles: {
            create: {
              roleId: role.id,
            },
          },
        },
        include: userAccessInclude,
      });
    });

    return this.toAuthenticatedRecord(user);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        forcePasswordChange: false,
      },
    });
  }

  async persistRefreshToken(
    userId: string,
    tokenId: string,
    tokenFamily: string,
    tokenHash: string,
    expiresAt: Date,
    context?: RequestContext,
  ): Promise<void> {
    const data: Prisma.RefreshTokenUncheckedCreateInput = {
      id: tokenId,
      userId,
      tokenFamily,
      tokenHash,
      expiresAt,
    };

    if (context?.ipAddress) {
      data.ipAddress = context.ipAddress;
    }

    if (context?.userAgent) {
      data.userAgent = context.userAgent;
    }

    await this.prisma.refreshToken.create({
      data,
    });
  }

  async findRefreshToken(tokenId: string): Promise<{
    userId: string;
    tokenHash: string;
    tokenFamily: string;
    expiresAt: Date;
    revokedAt: Date | null;
  } | null> {
    return this.prisma.refreshToken.findUnique({
      where: { id: tokenId },
      select: {
        userId: true,
        tokenHash: true,
        tokenFamily: true,
        expiresAt: true,
        revokedAt: true,
      },
    });
  }

  async rotateRefreshToken(tokenId: string, replacedByTokenId: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: {
        revokedAt: new Date(),
        replacedByTokenId,
      },
    });
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        id: tokenId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async revokeRefreshTokenFamily(tokenFamily: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        tokenFamily,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async createPasswordReset(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    context?: RequestContext,
  ): Promise<void> {
    const data: Prisma.PasswordResetTokenUncheckedCreateInput = {
      userId,
      tokenHash,
      expiresAt,
    };

    if (context?.ipAddress) {
      data.ipAddress = context.ipAddress;
    }

    if (context?.userAgent) {
      data.userAgent = context.userAgent;
    }

    await this.prisma.passwordResetToken.create({
      data,
    });
  }

  async consumePasswordReset(tokenHash: string, passwordHash: string): Promise<boolean> {
    const reset = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        consumedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!reset) {
      return false;
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: reset.userId },
        data: {
          passwordHash,
          forcePasswordChange: false,
        },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: reset.id },
        data: { consumedAt: new Date() },
      }),
    ]);

    return true;
  }

  async createEmailVerification(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    context?: RequestContext,
  ): Promise<void> {
    const data: Prisma.EmailVerificationTokenUncheckedCreateInput = {
      userId,
      tokenHash,
      expiresAt,
    };

    if (context?.ipAddress) {
      data.ipAddress = context.ipAddress;
    }

    if (context?.userAgent) {
      data.userAgent = context.userAgent;
    }

    await this.prisma.emailVerificationToken.create({
      data,
    });
  }

  async consumeEmailVerification(tokenHash: string): Promise<boolean> {
    const verification = await this.prisma.emailVerificationToken.findFirst({
      where: {
        tokenHash,
        consumedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verification) {
      return false;
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verification.userId },
        data: {
          status: "ACTIVE",
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: verification.id },
        data: { consumedAt: new Date() },
      }),
    ]);

    return true;
  }

  private toAuthenticatedRecord(user: UserWithAccess): AuthenticatedUserRecord {
    const assignedRoles = user.roles.map((assignment) => assignment.role.code);
    const roles = Array.from(new Set([user.role.code, ...assignedRoles]));
    const permissionCodes = [
      ...user.role.permissions.map((rolePermission) => rolePermission.permission.code),
      ...user.roles.flatMap((assignment) =>
        assignment.role.permissions.map((rolePermission) => rolePermission.permission.code),
      ),
    ];

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      passwordHash: user.passwordHash,
      role: user.role.code,
      roles,
      permissions: Array.from(new Set(permissionCodes)),
      status: user.status,
      emailVerified: user.emailVerified,
      forcePasswordChange: user.forcePasswordChange,
    };
  }
}
