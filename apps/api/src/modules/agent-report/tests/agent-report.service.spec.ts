import { principal } from "../../../shared/tests/booking-harness";
import { AgentReportMapper } from "../mappers/agent-report.mapper";
import { AgentReportRepository } from "../repositories/agent-report.repository";
import { AgentReportService } from "../services/agent-report.service";
import { AgentReportValidator } from "../validators/agent-report.validator";

describe("AgentReportService", () => {
  it("reports an agent with no bookings as zeros, not sample figures", async () => {
    const service = new AgentReportService(
      new AgentReportRepository(),
      new AgentReportValidator(),
      { listBookings: () => Promise.resolve([]) } as never,
      { listCustomers: () => ({ customers: [], total: 0, page: 1, pageSize: 100 }) } as never,
      new AgentReportMapper(),
    );
    const reports = await service.getReports(principal({ roles: ["TRAVEL_AGENT"] }));

    expect(reports.dailyBookings.status).toBe("READY");
    expect(reports.bookingTrends).toHaveLength(7);
    expect(reports.bookingTrends.every((point) => point.bookings === 0)).toBe(true);
    expect(reports.cancellationTrends.every((point) => point.cancellations === 0)).toBe(true);
    expect(reports.topRoutes).toEqual([]);
    expect(reports.exports.csvFileName).toContain(".csv");
    expect(reports.exports.pdfFileName).toContain(".pdf");
  });
});
