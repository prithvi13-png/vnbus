import type { ActivityActorType } from "@prisma/client";

export class ActivityLogEntity {
  constructor(
    readonly id: string,
    readonly actorType: ActivityActorType,
    readonly actorUserId: string | null,
    readonly action: string,
    readonly message: string,
    readonly entityType: string | null,
    readonly entityId: string | null,
    readonly ipAddress: string | null,
    readonly userAgent: string | null,
    readonly device: string | null,
    readonly browser: string | null,
    readonly createdAt: Date,
  ) {}
}
