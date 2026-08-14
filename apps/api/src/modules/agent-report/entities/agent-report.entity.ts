import type { AgentReportRecord, AgentReportsResponse } from "@vnbus/types";

export class AgentReportEntity implements AgentReportRecord {
  readonly reportId!: AgentReportRecord["reportId"];
  readonly name!: AgentReportRecord["name"];
  readonly period!: AgentReportRecord["period"];
  readonly status!: AgentReportRecord["status"];
  readonly generatedAt!: AgentReportRecord["generatedAt"];
  readonly rows!: AgentReportRecord["rows"];

  constructor(report: AgentReportRecord) {
    Object.assign(this, report);
  }
}

export class AgentReportsEntity implements AgentReportsResponse {
  readonly dailyBookings!: AgentReportsResponse["dailyBookings"];
  readonly weeklyBookings!: AgentReportsResponse["weeklyBookings"];
  readonly monthlyBookings!: AgentReportsResponse["monthlyBookings"];
  readonly topRoutes!: AgentReportsResponse["topRoutes"];
  readonly topCustomers!: AgentReportsResponse["topCustomers"];
  readonly bookingTrends!: AgentReportsResponse["bookingTrends"];
  readonly revenueTrends!: AgentReportsResponse["revenueTrends"];
  readonly cancellationTrends!: AgentReportsResponse["cancellationTrends"];
  readonly journeyDistribution!: AgentReportsResponse["journeyDistribution"];
  readonly exports!: AgentReportsResponse["exports"];

  constructor(reports: AgentReportsResponse) {
    Object.assign(this, reports);
  }
}
