import { ReportsRepository } from "../repositories/reports.repository";
import { ReportsService } from "../services/reports.service";
import { ReportsModuleValidator } from "../validators/reports.validator";

describe("ReportsService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new ReportsService(new ReportsRepository(), new ReportsModuleValidator());
    const summary = service.getSummary();

    expect(summary.module).toBe("reports");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("generates admin reports with export metadata", () => {
    const service = new ReportsService(new ReportsRepository(), new ReportsModuleValidator());
    const generated = service.generateAdminReport({ type: "BOOKINGS", period: "MONTHLY" });
    const reports = service.getAdminReports();

    expect(generated.csvFileName).toContain("bookings");
    expect(reports.reports.map((report) => report.reportId)).toContain(generated.reportId);
    expect(reports.agentPerformance.length).toBeGreaterThan(0);
  });
});
