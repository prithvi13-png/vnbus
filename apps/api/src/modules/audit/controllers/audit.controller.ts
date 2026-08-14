import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { AdminAuditLogRecord } from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { AuditSummaryDto } from "../dto/audit-summary.dto";
import { ListAuditLogsQueryDto } from "../dto/list-audit-logs-query.dto";
import { AuditService } from "../services/audit.service";

@ApiTags("Audit")
@ApiBearerAuth()
@Controller("audit")
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Public()
  @Get("health")
  getHealth(): AuditSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("capabilities")
  getCapabilities(): AuditSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("logs")
  @ApiOkResponse({ description: "Admin audit logs for sensitive operations" })
  listLogs(@Query() query: ListAuditLogsQueryDto): AdminAuditLogRecord[] {
    return this.service.listLogs(query);
  }
}
