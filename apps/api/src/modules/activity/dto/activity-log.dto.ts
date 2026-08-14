export class ActivityLogDto {
  id: string;
  actorType: string;
  actorUserId: string | null;
  action: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  device: string | null;
  browser: string | null;
  createdAt: string;
}
