import {
  bookingRequest,
  createBookingHarness,
  futureDate,
  principal,
  searchTrip,
} from "../../../shared/tests/booking-harness";
import { ReportsRepository } from "../repositories/reports.repository";
import { ReportsService } from "../services/reports.service";
import { ReportsModuleValidator } from "../validators/reports.validator";

function createReports() {
  const harness = createBookingHarness();
  const service = new ReportsService(
    new ReportsRepository(),
    new ReportsModuleValidator(),
    harness.bookingService,
  );

  return { ...harness, service };
}

describe("ReportsService", () => {
  it("returns module readiness and capabilities", () => {
    const summary = createReports().service.getSummary();

    expect(summary.module).toBe("reports");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("starts with no reports and no invented figures", async () => {
    const reports = await createReports().service.getAdminReports();

    expect(reports.reports).toEqual([]);
    expect(reports.topRoutes).toEqual([]);
    expect(reports.agentPerformance).toEqual([]);
    expect(reports.cancellationRate).toBe(0);
  });

  it("generates reports counted from real bookings", async () => {
    const harness = createReports();
    const journeyDate = futureDate();
    const trip = await searchTrip(harness.supplierManager, journeyDate);
    await harness.bookingService.createBooking(bookingRequest(trip, journeyDate), principal());

    const generated = await harness.service.generateAdminReport({
      type: "BOOKINGS",
      period: "DAILY",
    });
    const reports = await harness.service.getAdminReports();

    expect(generated.csvFileName).toContain("bookings");
    expect(generated.rows).toHaveLength(7);
    expect(generated.rows.at(-1)).toMatchObject({ bookings: 1, revenue: 1050 });
    expect(reports.reports.map((report) => report.reportId)).toContain(generated.reportId);
    expect(reports.topRoutes[0]?.bookings).toBe(1);
  });
});
