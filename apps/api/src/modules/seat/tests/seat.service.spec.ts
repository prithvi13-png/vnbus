import { DistributedLockService } from "../../integration/services/distributed-lock.service";
import { IdempotencyService } from "../../integration/services/idempotency.service";
import { createTestSupplierManager } from "../../integration/tests/integration-test-helpers";
import { SeatRepository } from "../repositories/seat.repository";
import { SeatService } from "../services/seat.service";
import { SeatModuleValidator } from "../validators/seat.validator";

describe("SeatService", () => {
  const createService = (): SeatService =>
    new SeatService(
      new SeatRepository(),
      new SeatModuleValidator(),
      createTestSupplierManager(),
      new IdempotencyService(),
      new DistributedLockService(),
    );

  it("returns module readiness and capabilities", () => {
    const service = createService();
    const summary = service.getSummary();

    expect(summary.module).toBe("seat");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("returns a mock supplier layout and holds seats", async () => {
    const service = createService();
    const journeyDate = tomorrowIsoDate();
    const layout = await service.getSeatLayout("mock-route-001-1", journeyDate);
    const firstSeat = layout.decks
      .flatMap((deck) => deck.seats)
      .find((seat) => seat.status === "AVAILABLE");

    expect(firstSeat).toBeDefined();

    const hold = await service.holdSeats({
      supplierCode: "MOCK",
      tripId: layout.tripId,
      journeyDate,
      seatNumbers: [firstSeat?.seatNumber ?? "1A"],
    });

    expect(hold.status).toBe("SEAT_HELD");
    expect(hold.heldSeats).toHaveLength(1);
    expect(hold.fare.grandTotal.amount).toBeGreaterThan(0);
  });
});

function tomorrowIsoDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);

  return date.toISOString().slice(0, 10);
}
