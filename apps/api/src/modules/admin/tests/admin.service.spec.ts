import { EmailLoggerService } from "../../../shared/email/email-logger.service";
import {
  bookingRequest,
  createBookingHarness,
  futureDate,
  principal,
  searchTrip,
} from "../../../shared/tests/booking-harness";
import { HealthRepository } from "../../health/repositories/health.repository";
import { HealthService } from "../../health/services/health.service";
import { HealthValidator } from "../../health/validators/health.validator";
import { AdminRepository } from "../repositories/admin.repository";
import { AdminService } from "../services/admin.service";
import { AdminModuleValidator } from "../validators/admin.validator";

function createAdmin() {
  const harness = createBookingHarness();
  const service = new AdminService(
    new AdminRepository(harness.prisma.asPrismaService()),
    new AdminModuleValidator(),
    harness.bookingService,
    harness.ticketService,
    new HealthService(new HealthRepository(), new HealthValidator()),
    harness.notificationService,
    new EmailLoggerService(),
  );

  return { ...harness, service };
}

describe("AdminService", () => {
  it("returns module readiness and capabilities", () => {
    const { service } = createAdmin();
    const summary = service.getSummary();

    expect(summary.module).toBe("admin");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("shows an empty platform as empty, not as sample figures", async () => {
    const { service } = createAdmin();

    const dashboard = await service.getDashboard();
    const bookings = await service.listBookings({ page: 1, pageSize: 10 });

    expect(dashboard.metrics.todaysBookings).toBe(0);
    expect(dashboard.metrics.revenue.amount).toBe(0);
    expect(dashboard.metrics.users).toBe(0);
    expect(dashboard.popularRoutes).toEqual([]);
    expect(dashboard.mostActiveCustomers).toEqual([]);
    expect(dashboard.emailQueueStatus.queued).toBe(0);
    expect(dashboard.systemHealth.length).toBeGreaterThan(0);
    expect(bookings.total).toBe(0);
  });

  it("counts real bookings and accounts", async () => {
    const admin = createAdmin();
    admin.prisma.addUser({ roleCode: "CUSTOMER" });
    admin.prisma.addUser({ roleCode: "TRAVEL_AGENT" });
    const journeyDate = futureDate();
    const trip = await searchTrip(admin.supplierManager, journeyDate);
    await admin.bookingService.createBooking(bookingRequest(trip, journeyDate), principal());

    const dashboard = await admin.service.getDashboard();
    const bookings = await admin.service.listBookings({ page: 1, pageSize: 10 });

    expect(dashboard.metrics.todaysBookings).toBe(1);
    expect(dashboard.metrics.revenue.amount).toBe(1050);
    expect(dashboard.metrics.upcomingJourneys).toBe(1);
    expect(dashboard.metrics.users).toBe(2);
    expect(dashboard.metrics.travelAgents).toBe(1);
    expect(dashboard.popularRoutes[0]?.route).toBe("Bangalore to Hyderabad");
    expect(dashboard.topOperators[0]?.operatorName).toBe(trip.operatorName);
    expect(bookings.total).toBe(1);
    expect(bookings.bookings[0]?.customerName).toBe("Asha Rao");
  });

  it("edits and previews the templates outgoing email uses", () => {
    const { service } = createAdmin();
    const before = service.listEmailTemplates().find((item) => item.key === "booking-cancelled");
    const updated = service.updateEmailTemplate(
      "booking-cancelled",
      { subject: "Ticket {{bookingReference}} cancelled" },
      principal({ email: "admin@test.invalid", roles: ["ADMIN"] }),
    );
    const preview = service.previewEmailTemplate("booking-cancelled", {
      variables: { bookingReference: "VNB-123" },
    });

    expect(before?.version).toBe(1);
    expect(updated.version).toBe(2);
    expect(updated.versionHistory[0]?.changedBy).toBe("admin@test.invalid");
    expect(preview.subject).toBe("Ticket VNB-123 cancelled");
  });
});
