import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../../../shared/prisma/prisma.service";
import type { UpdateProfileDto } from "../dto/update-profile.dto";

const rolePermissionInclude = {
  permissions: {
    include: {
      permission: true,
    },
  },
} satisfies Prisma.RoleInclude;

const profileAccessInclude = {
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

export type ProfileWithAccess = Prisma.UserGetPayload<{ include: typeof profileAccessInclude }>;

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<ProfileWithAccess | null> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: profileAccessInclude,
    });
  }

  async update(userId: string, input: UpdateProfileDto): Promise<ProfileWithAccess | null> {
    return this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.user.findFirst({
        where: {
          id: userId,
          deletedAt: null,
        },
        include: {
          customer: true,
          agent: true,
        },
      });

      if (!existing) {
        return null;
      }

      const data: Prisma.UserUpdateInput = {};

      if (input.firstName !== undefined) {
        data.firstName = input.firstName.trim();
      }

      if (input.lastName !== undefined) {
        data.lastName = input.lastName.trim();
      }

      if (input.phone !== undefined) {
        data.phone = input.phone.trim();
      }

      if (input.avatar !== undefined) {
        data.avatar = input.avatar.trim() || null;
      }

      await transaction.user.update({
        where: { id: userId },
        data,
      });

      const nextFirstName = input.firstName?.trim() ?? existing.firstName;
      const nextLastName = input.lastName?.trim() ?? existing.lastName;
      const nextPhone = input.phone?.trim() ?? existing.phone;
      const fullName = `${nextFirstName} ${nextLastName}`.trim();

      if (existing.customer) {
        await transaction.customer.update({
          where: { userId },
          data: {
            fullName,
            phone: nextPhone,
          },
        });
      }

      if (existing.agent) {
        await transaction.agent.update({
          where: { userId },
          data: {
            contactName: fullName,
            phone: nextPhone,
          },
        });
      }

      return transaction.user.findUnique({
        where: { id: userId },
        include: profileAccessInclude,
      });
    });
  }
}
