import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { AdminReportRecord, AdminReportsResponse } from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { CreateAdminReportDto } from "../dto/admin-report.dto";
import { ReportsSummaryDto } from "../dto/reports-summary.dto";
import { ReportsService } from "../services/reports.service";

@ApiTags("Reports")
@ApiBearerAuth()
@Controller("reports")
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Public()
  @Get("health")
  getHealth(): ReportsSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("capabilities")
  getCapabilities(): ReportsSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("admin")
  @ApiOkResponse({ description: "Admin reports and export metadata" })
  getAdminReports(): AdminReportsResponse {
    return this.service.getAdminReports();
  }

  @Roles("ADMIN")
  @Post("admin")
  @ApiOkResponse({ description: "Generate mock admin report" })
  generateAdminReport(@Body() dto: CreateAdminReportDto): AdminReportRecord {
    return this.service.generateAdminReport(dto);
  }
}
