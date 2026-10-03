import { EmailLoggerService } from "../../../shared/email/email-logger.service";
import { HealthRepository } from "../../health/repositories/health.repository";
import { HealthService } from "../../health/services/health.service";
import { HealthValidator } from "../../health/validators/health.validator";
import { MonitoringRepository } from "../repositories/monitoring.repository";
import { MonitoringService } from "../services/monitoring.service";
import { MonitoringValidator } from "../validators/monitoring.validator";

describe("MonitoringService", () => {
  it("reports live readings and the real health checks", () => {
    const service = new MonitoringService(
      new MonitoringRepository(
        new HealthService(new HealthRepository(), new HealthValidator()),
        new EmailLoggerService(),
      ),
      new MonitoringValidator(),
    );
    const dashboard = service.getDashboard();

    expect(dashboard.components.map((item) => item.component)).toContain("DATABASE");
    expect(dashboard.cpu).toBeGreaterThanOrEqual(0);
    expect(dashboard.memory).toBeGreaterThan(0);
    expect(dashboard.queueDepth).toBe(0);
    expect(dashboard.components.every((item) => item.uptimePercentage === 0)).toBe(true);
  });
});
