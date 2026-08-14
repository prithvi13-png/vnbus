import { Injectable } from "@nestjs/common";
import type { Prisma, Role } from "@prisma/client";

import { PrismaService } from "../../../shared/prisma/prisma.service";
import type { CreateUserDto } from "../dto/create-user.dto";
import type { ListUsersQueryDto } from "../dto/list-users-query.dto";
import type { UpdateUserDto } from "../dto/update-user.dto";

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

export type UserWithAccess = Prisma.UserGetPayload<{ include: typeof userAccessInclude }>;

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(query: ListUsersQueryDto): Promise<UserWithAccess[]> {
    const where: Prisma.UserWhereInput = {};

    if (!query.includeDeleted) {
      where.deletedAt = null;
    }

    if (query.roleCode) {
      where.role = {
        code: query.roleCode,
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      include: userAccessInclude,
      orderBy: {
        createdAt: "desc",
      },
      take: query.limit,
    });
  }

  findById(id: string, includeDeleted = false): Promise<UserWithAccess | null> {
    const where: Prisma.UserWhereInput = { id };

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return this.prisma.user.findFirst({
      where,
      include: userAccessInclude,
    });
  }

  findByEmail(email: string, includeDeleted = false): Promise<UserWithAccess | null> {
    const where: Prisma.UserWhereInput = { email };

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return this.prisma.user.findFirst({
      where,
      include: userAccessInclude,
    });
  }

  findByPhone(phone: string, includeDeleted = false): Promise<UserWithAccess | null> {
    const where: Prisma.UserWhereInput = { phone };

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return this.prisma.user.findFirst({
      where,
      include: userAccessInclude,
    });
  }

  findRoleByCode(code: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { code },
    });
  }

  create(input: CreateUserDto, passwordHash: string, roleId: string): Promise<UserWithAccess> {
    return this.prisma.user.create({
      data: {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email.toLowerCase(),
        phone: input.phone.trim(),
        passwordHash,
        roleId,
        status: input.status ?? "ACTIVE",
        emailVerified: input.emailVerified ?? false,
        forcePasswordChange: input.forcePasswordChange ?? true,
        roles: {
          create: {
            roleId,
          },
        },
      },
      include: userAccessInclude,
    });
  }

  async update(id: string, input: UpdateUserDto, roleId?: string): Promise<UserWithAccess> {
    const data: Prisma.UserUpdateInput = {};

    if (input.firstName !== undefined) {
      data.firstName = input.firstName.trim();
    }

    if (input.lastName !== undefined) {
      data.lastName = input.lastName.trim();
    }

    if (input.email !== undefined) {
      data.email = input.email.toLowerCase();
    }

    if (input.phone !== undefined) {
      data.phone = input.phone.trim();
    }

    if (input.avatar !== undefined) {
      data.avatar = input.avatar.trim() || null;
    }

    if (input.status !== undefined) {
      data.status = input.status;
    }

    if (input.emailVerified !== undefined) {
      data.emailVerified = input.emailVerified;
      data.emailVerifiedAt = input.emailVerified ? new Date() : null;
    }

    if (input.forcePasswordChange !== undefined) {
      data.forcePasswordChange = input.forcePasswordChange;
    }

    if (roleId) {
      data.role = {
        connect: { id: roleId },
      };
    }

    return this.prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { id },
        data,
      });

      if (roleId) {
        await transaction.userRoleAssignment.deleteMany({
          where: { userId: id },
        });
        await transaction.userRoleAssignment.create({
          data: {
            userId: id,
            roleId,
          },
        });
      }

      return transaction.user.findUniqueOrThrow({
        where: { id },
        include: userAccessInclude,
      });
    });
  }

  softDelete(id: string): Promise<UserWithAccess> {
    return this.prisma.user.update({
      where: { id },
      data: {
        status: "DEACTIVATED",
        deletedAt: new Date(),
      },
      include: userAccessInclude,
    });
  }
}
