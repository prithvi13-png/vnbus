import { GoneException } from "@nestjs/common";

import {
  createSupplierManager,
  futureDate,
  searchTrip,
} from "../../../shared/tests/booking-harness";
import { SeatRepository } from "../repositories/seat.repository";
import { SeatService } from "../services/seat.service";
import { SeatModuleValidator } from "../validators/seat.validator";

describe("SeatService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new SeatService(
      new SeatRepository(),
      new SeatModuleValidator(),
      createSupplierManager(),
    );
    const summary = service.getSummary();

    expect(summary.module).toBe("seat");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("shows the supplier's seat map with the searched trip's details", async () => {
    const manager = createSupplierManager();
    const service = new SeatService(new SeatRepository(), new SeatModuleValidator(), manager);
    const journeyDate = futureDate();
    const trip = await searchTrip(manager, journeyDate);

    const layout = await service.getSeatLayout(trip.tripId, journeyDate);

    expect(layout.operatorName).toBe(trip.operatorName);
    expect(layout.departureTime).toBe(trip.departureTime);
    expect(layout.boardingPoints.map((point) => point.id)).toEqual(["BP1"]);
    expect(layout.decks.flatMap((deck) => deck.seats).map((seat) => seat.seatNumber)).toEqual([
      "L1",
      "L2",
      "L3",
      "U1",
    ]);
  });

  it("asks for a fresh search once the trip has expired", async () => {
    const service = new SeatService(
      new SeatRepository(),
      new SeatModuleValidator(),
      createSupplierManager(),
    );

    await expect(service.getSeatLayout("unknown~1~1~6", futureDate())).rejects.toBeInstanceOf(
      GoneException,
    );
  });
});
