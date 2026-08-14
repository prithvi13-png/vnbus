import { Injectable } from "@nestjs/common";
import type { AdminAuditLogRecord } from "@vnbus/types";

import type { ListAuditLogsQueryDto } from "../dto/list-audit-logs-query.dto";
import { AuditSummaryDto } from "../dto/audit-summary.dto";
import type { AuditModulePort } from "../interfaces/audit.interface";
import { AuditRepository } from "../repositories/audit.repository";
import { AuditModuleValidator } from "../validators/audit.validator";

@Injectable()
export class AuditService implements AuditModulePort {
  constructor(
    private readonly repository: AuditRepository,
    private readonly validator: AuditModuleValidator,
  ) {}

  getSummary(): AuditSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new AuditSummaryDto(summary);
  }

  listLogs(query: ListAuditLogsQueryDto): AdminAuditLogRecord[] {
    return this.repository.listLogs(query);
  }
}
