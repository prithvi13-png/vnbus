import { Injectable } from "@nestjs/common";
import type { AdminReportRecord, AdminReportsResponse } from "@vnbus/types";

import type { CreateAdminReportDto } from "../dto/admin-report.dto";
import { ReportsSummaryDto } from "../dto/reports-summary.dto";
import type { ReportsModulePort } from "../interfaces/reports.interface";
import { ReportsRepository } from "../repositories/reports.repository";
import { ReportsModuleValidator } from "../validators/reports.validator";

@Injectable()
export class ReportsService implements ReportsModulePort {
  constructor(
    private readonly repository: ReportsRepository,
    private readonly validator: ReportsModuleValidator,
  ) {}

  getSummary(): ReportsSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new ReportsSummaryDto(summary);
  }

  getAdminReports(): AdminReportsResponse {
    return this.repository.getAdminReports();
  }

  generateAdminReport(dto: CreateAdminReportDto): AdminReportRecord {
    return this.repository.generateAdminReport(dto);
  }
}
