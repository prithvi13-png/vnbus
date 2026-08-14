import type { AgentReportsResponse } from "@vnbus/types";

export interface AgentReportModulePort {
  getReports(): AgentReportsResponse;
}
