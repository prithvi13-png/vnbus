import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../../../shared/prisma/prisma.service";
import type { CreateRoleDto, UpdateRoleDto } from "../dto/admin-role.dto";

const roleWithPermissionsInclude = {
  permissions: {
    include: {
      permission: true,
    },
  },
} satisfies Prisma.RoleInclude;

type RoleWithPermissions = Prisma.RoleGetPayload<{ include: typeof roleWithPermissionsInclude }>;

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany() {
    return this.prisma.role.findMany({
      include: roleWithPermissionsInclude,
      orderBy: {
        name: "asc",
      },
    });
  }

  findByCode(code: string) {
    return this.prisma.role.findUnique({
      where: { code },
      include: roleWithPermissionsInclude,
    });
  }

  async create(input: CreateRoleDto): Promise<RoleWithPermissions> {
    return this.prisma.$transaction(async (transaction) => {
      const role = await transaction.role.create({
        data: {
          code: input.code,
          name: input.name,
          description: input.description ?? null,
          isSystem: false,
        },
      });

      await this.assignPermissionsInTransaction(transaction, role.id, input.permissions ?? []);

      return transaction.role.findUniqueOrThrow({
        where: { id: role.id },
        include: roleWithPermissionsInclude,
      });
    });
  }

  update(code: string, input: UpdateRoleDto): Promise<RoleWithPermissions> {
    return this.prisma.role.update({
      where: { code },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
      },
      include: roleWithPermissionsInclude,
    });
  }

  async replacePermissions(code: string, permissionCodes: string[]): Promise<RoleWithPermissions> {
    return this.prisma.$transaction(async (transaction) => {
      const role = await transaction.role.findUniqueOrThrow({ where: { code } });
      await transaction.rolePermission.deleteMany({ where: { roleId: role.id } });
      await this.assignPermissionsInTransaction(transaction, role.id, permissionCodes);

      return transaction.role.findUniqueOrThrow({
        where: { id: role.id },
        include: roleWithPermissionsInclude,
      });
    });
  }

  async assignPermissions(code: string, permissionCodes: string[]): Promise<RoleWithPermissions> {
    return this.prisma.$transaction(async (transaction) => {
      const role = await transaction.role.findUniqueOrThrow({ where: { code } });
      await this.assignPermissionsInTransaction(transaction, role.id, permissionCodes);

      return transaction.role.findUniqueOrThrow({
        where: { id: role.id },
        include: roleWithPermissionsInclude,
      });
    });
  }

  async removePermissions(code: string, permissionCodes: string[]): Promise<RoleWithPermissions> {
    return this.prisma.$transaction(async (transaction) => {
      const role = await transaction.role.findUniqueOrThrow({ where: { code } });
      const permissions = await transaction.permission.findMany({
        where: { code: { in: permissionCodes } },
      });
      await transaction.rolePermission.deleteMany({
        where: {
          roleId: role.id,
          permissionId: { in: permissions.map((permission) => permission.id) },
        },
      });

      return transaction.role.findUniqueOrThrow({
        where: { id: role.id },
        include: roleWithPermissionsInclude,
      });
    });
  }

  private async assignPermissionsInTransaction(
    transaction: Prisma.TransactionClient,
    roleId: string,
    permissionCodes: string[],
  ): Promise<void> {
    for (const code of permissionCodes) {
      const permission = await transaction.permission.upsert({
        where: { code },
        update: {},
        create: {
          code,
          description: `${code} permission`,
        },
      });

      await transaction.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId: permission.id,
        },
      });
    }
  }
}
