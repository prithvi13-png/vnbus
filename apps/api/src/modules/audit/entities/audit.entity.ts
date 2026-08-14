import type { ModuleSummary } from "../../../shared/domain/module-summary";
import type { AdminAuditLogRecord } from "@vnbus/types";

export class AuditContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number,
  ) {}

  static fromSummary(summary: ModuleSummary): AuditContextEntity {
    return new AuditContextEntity(
      summary.module,
      summary.boundedContext,
      summary.capabilities.length,
    );
  }
}

export class AdminAuditLogEntity {
  constructor(readonly auditLog: AdminAuditLogRecord) {}
}
