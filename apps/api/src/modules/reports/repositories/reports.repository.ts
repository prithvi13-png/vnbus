import { Injectable } from "@nestjs/common";
import type {
  AdminReportRecord,
  AdminReportsResponse,
  CreateAdminReportRequest,
  BookingRecord,
} from "@vnbus/types";

import {
  dailyTrend,
  groupBy,
  isCancelled,
  monthlyTrend,
  percentage,
  popularRoutes,
  sumFares,
  weeklyTrend,
  yearlyTrend,
} from "../../../shared/domain/booking-metrics";
import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "reports",
  boundedContext: "Reports and exports",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Report catalog",
      description: "Prepare report definitions for admin and agent users.",
    },
    {
      name: "Export queue",
      description: "Model asynchronous report generation jobs.",
    },
    {
      name: "RBAC scope",
      description: "Apply role-specific visibility to report outputs.",
    },
  ],
} satisfies ModuleSummary;

/**
 * Admin reports over real bookings. Generated reports are kept in memory for
 * the session that made them.
 */
@Injectable()
export class ReportsRepository {
  private readonly reports = new Map<string, AdminReportRecord>();

  findSummary(): ModuleSummary {
    return summary;
  }

  getAdminReports(bookings: BookingRecord[]): AdminReportsResponse {
    const agentBookings = bookings.filter((booking) => booking.channel === "AGENT");

    return {
      reports: [...this.reports.values()].sort((left, right) =>
        right.generatedAt.localeCompare(left.generatedAt),
      ),
      topRoutes: popularRoutes(bookings),
      agentPerformance: groupBy(agentBookings, (booking) => booking.agentId ?? "unknown").map(
        ([agentId, group]) => ({
          agentId,
          agencyName: agentId,
          bookings: group.length,
          revenue: { amount: sumFares(group), currency: "INR" as const },
          // Agent commission is not configured yet.
          commission: { amount: 0, currency: "INR" as const },
        }),
      ),
      cancellationRate: percentage(bookings.filter(isCancelled).length, bookings.length),
    };
  }

  generateAdminReport(
    input: CreateAdminReportRequest,
    bookings: BookingRecord[],
    now = new Date(),
  ): AdminReportRecord {
    const generatedAt = now.toISOString();
    const rows =
      input.period === "DAILY"
        ? dailyTrend(bookings, now)
        : input.period === "WEEKLY"
          ? weeklyTrend(bookings, now)
          : input.period === "MONTHLY"
            ? monthlyTrend(bookings, now)
            : yearlyTrend(bookings, now);
    const report: AdminReportRecord = {
      reportId: `RPT-ADM-${generatedAt.replaceAll(/[^0-9]/gu, "").slice(0, 14)}`,
      name: `${input.period} ${input.type.toLowerCase().replaceAll("_", " ")} report`,
      type: input.type,
      period: input.period,
      status: "READY",
      generatedAt,
      rows,
      csvFileName: `admin-${input.type.toLowerCase()}-${input.period.toLowerCase()}.csv`,
      pdfFileName: `admin-${input.type.toLowerCase()}-${input.period.toLowerCase()}.pdf`,
    };
    this.reports.set(report.reportId, report);

    return report;
  }
}
