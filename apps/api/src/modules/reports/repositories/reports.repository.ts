import { Injectable } from "@nestjs/common";
import type {
  AdminReportRecord,
  AdminReportsResponse,
  CreateAdminReportRequest,
} from "@vnbus/types";

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

@Injectable()
export class ReportsRepository {
  private readonly reports = new Map<string, AdminReportRecord>(
    seedReports().map((report) => [report.reportId, report]),
  );

  findSummary(): ModuleSummary {
    return summary;
  }

  getAdminReports(): AdminReportsResponse {
    return {
      reports: [...this.reports.values()],
      topRoutes: [
        {
          route: "Bangalore to Hyderabad",
          bookings: 318,
          revenue: { amount: 508800, currency: "INR" },
          cancellationRate: 1.9,
        },
        {
          route: "Chennai to Coimbatore",
          bookings: 242,
          revenue: { amount: 290400, currency: "INR" },
          cancellationRate: 2.4,
        },
      ],
      agentPerformance: [
        {
          agentId: "AGT-VN-001",
          agencyName: "Vriddhi Nexus Partner Desk",
          bookings: 84,
          revenue: { amount: 134400, currency: "INR" },
          commission: { amount: 6048, currency: "INR" },
        },
        {
          agentId: "AGT-SOUTH-002",
          agencyName: "South Corridor Travels",
          bookings: 62,
          revenue: { amount: 99200, currency: "INR" },
          commission: { amount: 4464, currency: "INR" },
        },
      ],
      cancellationRate: 1.7,
    };
  }

  generateAdminReport(input: CreateAdminReportRequest): AdminReportRecord {
    const generatedAt = new Date().toISOString();
    const report: AdminReportRecord = {
      reportId: `RPT-ADM-${generatedAt.replaceAll(/[^0-9]/gu, "").slice(0, 14)}`,
      name: `${input.period} ${input.type.toLowerCase().replaceAll("_", " ")} report`,
      type: input.type,
      period: input.period,
      status: "READY",
      generatedAt,
      rows: [
        { label: "Bookings", bookings: 318, revenue: 508800, cancellations: 6 },
        { label: "Revenue", bookings: 242, revenue: 290400, cancellations: 4 },
      ],
      csvFileName: `admin-${input.type.toLowerCase()}-${input.period.toLowerCase()}.csv`,
      pdfFileName: `admin-${input.type.toLowerCase()}-${input.period.toLowerCase()}.pdf`,
    };
    this.reports.set(report.reportId, report);

    return report;
  }
}

function seedReports(): AdminReportRecord[] {
  return [
    report("RPT-DAILY", "Daily Bookings", "BOOKINGS", "DAILY"),
    report("RPT-WEEKLY", "Weekly Revenue", "REVENUE", "WEEKLY"),
    report("RPT-MONTHLY", "Monthly Customer Growth", "CUSTOMER_GROWTH", "MONTHLY"),
    report("RPT-YEARLY", "Yearly Cancellation Rate", "CANCELLATION_RATE", "YEARLY"),
  ];
}

function report(
  reportId: string,
  name: string,
  type: AdminReportRecord["type"],
  period: AdminReportRecord["period"],
): AdminReportRecord {
  return {
    reportId,
    name,
    type,
    period,
    status: "READY",
    generatedAt: "2026-08-08T08:00:00.000Z",
    rows: [
      { label: "Mon", bookings: 118, revenue: 188800, cancellations: 3 },
      { label: "Tue", bookings: 142, revenue: 227200, cancellations: 4 },
      { label: "Wed", bookings: 136, revenue: 217600, cancellations: 5 },
    ],
    csvFileName: `${reportId.toLowerCase()}.csv`,
    pdfFileName: `${reportId.toLowerCase()}.pdf`,
  };
}
