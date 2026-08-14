import { ReservationRepository } from "../repositories/reservation.repository";
import { ReservationService } from "../services/reservation.service";
import { ReservationModuleValidator } from "../validators/reservation.validator";

describe("ReservationService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new ReservationService(
      new ReservationRepository(),
      new ReservationModuleValidator(),
    );
    const summary = service.getSummary();

    expect(summary.module).toBe("reservation");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });
});
