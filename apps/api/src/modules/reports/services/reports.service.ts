import { Injectable } from "@nestjs/common";
import type { AdminReportRecord, AdminReportsResponse } from "@vnbus/types";

import { BookingService } from "../../booking/services/booking.service";
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
    private readonly bookingService: BookingService,
  ) {}

  getSummary(): ReportsSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new ReportsSummaryDto(summary);
  }

  async getAdminReports(): Promise<AdminReportsResponse> {
    return this.repository.getAdminReports(await this.bookingService.listAllBookings());
  }

  async generateAdminReport(dto: CreateAdminReportDto): Promise<AdminReportRecord> {
    return this.repository.generateAdminReport(dto, await this.bookingService.listAllBookings());
  }
}
