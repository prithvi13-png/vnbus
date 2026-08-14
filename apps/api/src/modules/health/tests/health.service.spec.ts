import { HealthRepository } from "../repositories/health.repository";
import { HealthService } from "../services/health.service";
import { HealthValidator } from "../validators/health.validator";

describe("HealthService", () => {
  it("returns health, readiness, and liveness components", () => {
    const service = new HealthService(new HealthRepository(), new HealthValidator());

    expect(service.getHealth().components.map((item) => item.component)).toContain("DATABASE");
    expect(service.getHealth().components.map((item) => item.component)).toContain("PAYMENT");
    expect(service.getReady().status).toBe("HEALTHY");
    expect(service.getLive().components).toHaveLength(1);
  });
});
