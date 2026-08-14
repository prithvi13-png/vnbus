import { AgentReportMapper } from "../mappers/agent-report.mapper";
import { AgentReportRepository } from "../repositories/agent-report.repository";
import { AgentReportService } from "../services/agent-report.service";
import { AgentReportValidator } from "../validators/agent-report.validator";

describe("AgentReportService", () => {
  it("generates chart-ready mock reports and export metadata", () => {
    const service = new AgentReportService(
      new AgentReportRepository(),
      new AgentReportValidator(),
      { listBookings: () => [] } as never,
      { listCustomers: () => ({ customers: [], total: 0, page: 1, pageSize: 100 }) } as never,
      new AgentReportMapper(),
    );
    const reports = service.getReports();

    expect(reports.dailyBookings.status).toBe("READY");
    expect(reports.bookingTrends.length).toBeGreaterThan(0);
    expect(reports.exports.csvFileName).toContain(".csv");
    expect(reports.exports.pdfFileName).toContain(".pdf");
  });
});
