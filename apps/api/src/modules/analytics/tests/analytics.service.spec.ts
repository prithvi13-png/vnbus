import { AnalyticsRepository } from "../repositories/analytics.repository";
import { AnalyticsService } from "../services/analytics.service";
import { AnalyticsModuleValidator } from "../validators/analytics.validator";

describe("AnalyticsService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new AnalyticsService(new AnalyticsRepository(), new AnalyticsModuleValidator());
    const summary = service.getSummary();

    expect(summary.module).toBe("analytics");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("returns admin analytics chart datasets", () => {
    const service = new AnalyticsService(new AnalyticsRepository(), new AnalyticsModuleValidator());
    const analytics = service.getAdminAnalytics();

    expect(analytics.revenue.length).toBeGreaterThan(0);
    expect(analytics.routes[0]?.route).toContain("to");
    expect(analytics.operatorTrends.length).toBeGreaterThan(0);
  });
});
