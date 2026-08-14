import { Injectable } from "@nestjs/common";
import type { ActivityLog, Prisma } from "@prisma/client";

import { PrismaService } from "../../../shared/prisma/prisma.service";
import type { ListActivityQueryDto } from "../dto/list-activity-query.dto";
import type { ActivityLogInput } from "../interfaces/activity-log-input.interface";

@Injectable()
export class ActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: ActivityLogInput): Promise<ActivityLog> {
    const data: Prisma.ActivityLogUncheckedCreateInput = {
      actorType: input.actorType,
      action: input.action,
      message: input.message,
    };

    if (input.actorUserId) {
      data.actorUserId = input.actorUserId;
    }

    if (input.entityType) {
      data.entityType = input.entityType;
    }

    if (input.entityId) {
      data.entityId = input.entityId;
    }

    if (input.ipAddress) {
      data.ipAddress = input.ipAddress;
    }

    if (input.userAgent) {
      data.userAgent = input.userAgent;
    }

    if (input.requestId) {
      data.requestId = input.requestId;
    }

    if (input.metadata !== undefined) {
      data.metadata = input.metadata;
    }

    return this.prisma.activityLog.create({
      data,
    });
  }

  async findMany(query: ListActivityQueryDto): Promise<ActivityLog[]> {
    const where: Prisma.ActivityLogWhereInput = {};

    if (query.actorUserId) {
      where.actorUserId = query.actorUserId;
    }

    if (query.action) {
      where.action = query.action;
    }

    return this.prisma.activityLog.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: query.limit,
    });
  }
}
