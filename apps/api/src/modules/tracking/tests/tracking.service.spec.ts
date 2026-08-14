import { TrackingRepository } from "../repositories/tracking.repository";
import { TrackingService } from "../services/tracking.service";
import { TrackingModuleValidator } from "../validators/tracking.validator";

describe("TrackingService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new TrackingService(new TrackingRepository(), new TrackingModuleValidator());
    const summary = service.getSummary();

    expect(summary.module).toBe("tracking");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });
});
