import { MonitoringRepository } from "../repositories/monitoring.repository";
import { MonitoringService } from "../services/monitoring.service";
import { MonitoringValidator } from "../validators/monitoring.validator";

describe("MonitoringService", () => {
  it("returns mock monitoring snapshots", () => {
    const service = new MonitoringService(new MonitoringRepository(), new MonitoringValidator());
    const dashboard = service.getDashboard();

    expect(dashboard.components.map((item) => item.component)).toContain("API Status");
    expect(dashboard.cpu).toBeGreaterThan(0);
    expect(dashboard.queueDepth).toBeGreaterThan(0);
  });
});
