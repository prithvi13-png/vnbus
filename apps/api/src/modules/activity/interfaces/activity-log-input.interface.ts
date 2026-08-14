import type { ActivityActorType, Prisma } from "@prisma/client";

import type { RequestContext } from "../../../shared/http/request-context";

export interface ActivityLogInput extends RequestContext {
  actorType: ActivityActorType;
  actorUserId?: string;
  action: string;
  message: string;
  entityType?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
}
