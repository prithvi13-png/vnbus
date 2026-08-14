import type { BookingService } from "../../booking/services/booking.service";
import { BookingHistoryRepository } from "../repositories/booking-history.repository";
import { BookingHistoryService } from "../services/booking-history.service";
import { BookingHistoryModuleValidator } from "../validators/booking-history.validator";

describe("BookingHistoryService", () => {
  it("returns module readiness and delegates booking history slices", () => {
    const bookingService = {
      getHistory: jest.fn().mockReturnValue({ bookings: [], timeline: [] }),
      listUpcoming: jest.fn().mockReturnValue([]),
      listPast: jest.fn().mockReturnValue([]),
      listCancelled: jest.fn().mockReturnValue([]),
    } as unknown as BookingService;
    const service = new BookingHistoryService(
      new BookingHistoryRepository(),
      new BookingHistoryModuleValidator(),
      bookingService,
    );

    expect(service.getSummary().module).toBe("booking-history");
    expect(service.getHistory().bookings).toEqual([]);
    expect(service.listUpcoming()).toEqual([]);
    expect(service.listPast()).toEqual([]);
    expect(service.listCancelled()).toEqual([]);
  });
});
