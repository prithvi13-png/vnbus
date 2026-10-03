import { principal } from "../../../shared/tests/booking-harness";
import type { BookingService } from "../../booking/services/booking.service";
import { BookingHistoryRepository } from "../repositories/booking-history.repository";
import { BookingHistoryService } from "../services/booking-history.service";
import { BookingHistoryModuleValidator } from "../validators/booking-history.validator";

describe("BookingHistoryService", () => {
  it("returns module readiness and delegates the user's booking history slices", async () => {
    const bookingService = {
      getHistory: jest.fn().mockResolvedValue({ bookings: [], timeline: [] }),
      listUpcoming: jest.fn().mockResolvedValue([]),
      listPast: jest.fn().mockResolvedValue([]),
      listCancelled: jest.fn().mockResolvedValue([]),
    } as unknown as BookingService;
    const service = new BookingHistoryService(
      new BookingHistoryRepository(),
      new BookingHistoryModuleValidator(),
      bookingService,
    );
    const user = principal();

    expect(service.getSummary().module).toBe("booking-history");
    expect((await service.getHistory(user)).bookings).toEqual([]);
    expect(await service.listUpcoming(user)).toEqual([]);
    expect(await service.listPast(user)).toEqual([]);
    expect(await service.listCancelled(user)).toEqual([]);
    expect(bookingService.getHistory).toHaveBeenCalledWith(user);
  });
});
