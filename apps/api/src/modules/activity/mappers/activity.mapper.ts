import type { ActivityLog } from "@prisma/client";

import type { ActivityLogDto } from "../dto/activity-log.dto";
import { ActivityLogEntity } from "../entities/activity-log.entity";

export class ActivityMapper {
  static toEntity(activity: ActivityLog): ActivityLogEntity {
    return new ActivityLogEntity(
      activity.id,
      activity.actorType,
      activity.actorUserId,
      activity.action,
      activity.message,
      activity.entityType,
      activity.entityId,
      activity.ipAddress,
      activity.userAgent,
      parseDevice(activity.userAgent),
      parseBrowser(activity.userAgent),
      activity.createdAt,
    );
  }

  static toDto(entity: ActivityLogEntity): ActivityLogDto {
    return {
      id: entity.id,
      actorType: entity.actorType,
      actorUserId: entity.actorUserId,
      action: entity.action,
      message: entity.message,
      entityType: entity.entityType,
      entityId: entity.entityId,
      ipAddress: entity.ipAddress,
      userAgent: entity.userAgent,
      device: entity.device,
      browser: entity.browser,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}

function parseDevice(userAgent: string | null): string | null {
  if (!userAgent) {
    return null;
  }
  if (/iphone|android/iu.test(userAgent)) {
    return "Mobile";
  }
  if (/ipad|tablet/iu.test(userAgent)) {
    return "Tablet";
  }

  return "Desktop";
}

function parseBrowser(userAgent: string | null): string | null {
  if (!userAgent) {
    return null;
  }
  if (/edg/iu.test(userAgent)) {
    return "Edge";
  }
  if (/chrome/iu.test(userAgent)) {
    return "Chrome";
  }
  if (/firefox/iu.test(userAgent)) {
    return "Firefox";
  }
  if (/safari/iu.test(userAgent)) {
    return "Safari";
  }

  return "Unknown";
}
