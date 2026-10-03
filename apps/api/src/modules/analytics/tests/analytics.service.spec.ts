import {
  bookingRequest,
  createBookingHarness,
  futureDate,
  principal,
  searchTrip,
} from "../../../shared/tests/booking-harness";
import { AnalyticsRepository } from "../repositories/analytics.repository";
import { AnalyticsService } from "../services/analytics.service";
import { AnalyticsModuleValidator } from "../validators/analytics.validator";

function createAnalytics() {
  const harness = createBookingHarness();
  const service = new AnalyticsService(
    new AnalyticsRepository(harness.prisma.asPrismaService()),
    new AnalyticsModuleValidator(),
    harness.bookingService,
  );

  return { ...harness, service };
}

describe("AnalyticsService", () => {
  it("returns module readiness and capabilities", () => {
    const summary = createAnalytics().service.getSummary();

    expect(summary.module).toBe("analytics");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("charts real bookings and new accounts over the last week", async () => {
    const harness = createAnalytics();
    harness.prisma.addUser();
    const journeyDate = futureDate(3);
    const trip = await searchTrip(harness.supplierManager, journeyDate);
    await harness.bookingService.createBooking(bookingRequest(trip, journeyDate), principal());

    const analytics = await harness.service.getAdminAnalytics();

    expect(analytics.bookings).toHaveLength(7);
    expect(analytics.bookings.at(-1)?.bookings).toBe(1);
    expect(analytics.revenue.at(-1)?.revenue).toBe(1050);
    expect(analytics.customerGrowth.at(-1)?.bookings).toBe(1);
    expect(analytics.journeyTrends.reduce((sum, point) => sum + point.bookings, 0)).toBe(1);
    expect(analytics.routes[0]?.route).toBe("Bangalore to Hyderabad");
    expect(analytics.operatorTrends[0]?.operatorName).toBe(trip.operatorName);
    expect(analytics.retention).toEqual([]);
  });
});
