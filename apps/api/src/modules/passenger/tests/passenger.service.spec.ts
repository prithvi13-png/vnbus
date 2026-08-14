import { PassengerRepository } from "../repositories/passenger.repository";
import { PassengerService } from "../services/passenger.service";
import { PassengerModuleValidator } from "../validators/passenger.validator";

describe("PassengerService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new PassengerService(new PassengerRepository(), new PassengerModuleValidator());
    const summary = service.getSummary();

    expect(summary.module).toBe("passenger");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });
});
