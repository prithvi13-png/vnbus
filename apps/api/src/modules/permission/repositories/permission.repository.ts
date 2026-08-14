import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../../shared/prisma/prisma.service";

@Injectable()
export class PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany() {
    return this.prisma.permission.findMany({
      orderBy: {
        code: "asc",
      },
    });
  }
}
