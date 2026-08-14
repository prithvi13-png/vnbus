import { Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "agent-report",
  boundedContext: "B2B agent reports and exports",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Mock report generation",
      description: "Generate daily, weekly, monthly, customer, route, and trend reports.",
    },
    {
      name: "Export metadata",
      description: "Expose CSV and PDF export file names for frontend download actions.",
    },
    {
      name: "Chart-ready data",
      description: "Return Recharts-friendly series for the agent portal.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class AgentReportRepository {
  findSummary(): ModuleSummary {
    return summary;
  }
}
