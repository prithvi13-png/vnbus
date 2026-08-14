import { Injectable } from "@nestjs/common";
import type { AgentReportRecord, AgentReportsResponse } from "@vnbus/types";

import { AgentReportEntity, AgentReportsEntity } from "../entities/agent-report.entity";

@Injectable()
export class AgentReportMapper {
  toReport(report: AgentReportRecord): AgentReportEntity {
    return new AgentReportEntity(report);
  }

  toReports(reports: AgentReportsResponse): AgentReportsEntity {
    return new AgentReportsEntity(reports);
  }
}
