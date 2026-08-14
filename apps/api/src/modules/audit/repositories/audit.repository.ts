import { Injectable } from "@nestjs/common";
import type { AdminAuditLogRecord } from "@vnbus/types";

import type { ListAuditLogsQueryDto } from "../dto/list-audit-logs-query.dto";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

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

@Injectable()
export class AuditRepository {
  private readonly logs = seedAuditLogs();

  findSummary(): ModuleSummary {
    return summary;
  }

  listLogs(query: ListAuditLogsQueryDto): AdminAuditLogRecord[] {
    return this.logs
      .filter(
        (log) =>
          (!query.action || log.action.includes(query.action)) &&
          (!query.entityType || log.entityType === query.entityType) &&
          (!query.actor || log.actor.toLowerCase().includes(query.actor.toLowerCase())),
      )
      .slice(0, query.limit);
  }
}

function seedAuditLogs(): AdminAuditLogRecord[] {
  return [
    audit("AUD-001", "admin@vriddhinexus.com", "user.login", "user", "USR-001"),
    audit("AUD-002", "admin@vriddhinexus.com", "booking.cancelled", "booking", "VNB-ADM-002"),
    audit("AUD-003", "ops@vriddhinexus.com", "role.permission_assigned", "role", "ADMIN"),
    audit("AUD-004", "content@vriddhinexus.com", "cms.page_published", "cms_page", "CMS-FAQ"),
    audit("AUD-005", "growth@vriddhinexus.com", "coupon.updated", "coupon", "WELCOME500"),
  ];
}

function audit(
  auditId: string,
  actor: string,
  action: string,
  entityType: string,
  entityId: string,
): AdminAuditLogRecord {
  return {
    auditId,
    actor,
    action,
    entityType,
    entityId,
    ipAddress: "103.21.244.12",
    userAgent: "Mozilla/5.0 Chrome/126 AdminConsole",
    metadata: { source: "admin-portal", mock: true },
    createdAt: "2026-08-08T08:00:00.000Z",
  };
}
