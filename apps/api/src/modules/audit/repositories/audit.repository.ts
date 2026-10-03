import { Injectable } from "@nestjs/common";
import type { AdminAuditLogRecord } from "@vnbus/types";

import type { ListAuditLogsQueryDto } from "../dto/list-audit-logs-query.dto";

import type { ModuleSummary } from "../../../shared/domain/module-summary";
import { PrismaService } from "../../../shared/prisma/prisma.service";

const summary = {
  module: "audit",
  boundedContext: "Audit and activity logging",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Audit trail",
      description: "Capture actor, action, entity, and metadata records.",
    },
    {
      name: "Activity stream",
      description: "Prepare user-facing activity history.",
    },
    {
      name: "Compliance queries",
      description: "Expose filters for operational investigations.",
    },
  ],
} satisfies ModuleSummary;

/** The request activity log, which records every authenticated change. */
@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  findSummary(): ModuleSummary {
    return summary;
  }

  async listLogs(query: ListAuditLogsQueryDto): Promise<AdminAuditLogRecord[]> {
    const rows = await this.prisma.activityLog.findMany({
      where: {
        ...(query.action ? { action: { contains: query.action } } : {}),
        ...(query.entityType ? { entityType: query.entityType } : {}),
        ...(query.actor
          ? { actor: { email: { contains: query.actor, mode: "insensitive" as const } } }
          : {}),
      },
      include: { actor: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: query.limit,
    });

    return rows.map((row) => ({
      auditId: row.id,
      actor: row.actor?.email ?? row.actorType.toLowerCase(),
      action: row.action,
      entityType: row.entityType ?? "",
      entityId: row.entityId,
      ipAddress: row.ipAddress ?? "",
      userAgent: row.userAgent ?? "",
      metadata: (row.metadata as Record<string, unknown> | null) ?? {},
      createdAt: row.createdAt.toISOString(),
    }));
  }
}
