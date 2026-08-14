import { AdminRepository } from "../repositories/admin.repository";
import { AdminService } from "../services/admin.service";
import { AdminModuleValidator } from "../validators/admin.validator";

describe("AdminService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new AdminService(new AdminRepository(), new AdminModuleValidator());
    const summary = service.getSummary();

    expect(summary.module).toBe("admin");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("returns enterprise dashboard and admin booking fallbacks", () => {
    const service = new AdminService(new AdminRepository(), new AdminModuleValidator());
    const dashboard = service.getDashboard();
    const bookings = service.listBookings({ page: 1, pageSize: 10 });

    expect(dashboard.cards.map((card) => card.label)).toContain("Today's Bookings");
    expect(dashboard.systemHealth.length).toBeGreaterThan(0);
    expect(dashboard.emailQueueStatus.queued).toBeGreaterThan(0);
    expect(bookings.total).toBeGreaterThan(0);
  });

  it("updates and previews email templates", () => {
    const service = new AdminService(new AdminRepository(), new AdminModuleValidator());
    const updated = service.updateEmailTemplate("booking-confirmation", {
      subject: "Ticket {{bookingReference}} ready",
    });
    const preview = service.previewEmailTemplate("booking-confirmation", {
      variables: { bookingReference: "VNB-123", route: "Bangalore to Hyderabad" },
    });

    expect(updated.version).toBe(4);
    expect(preview.subject).toBe("Ticket VNB-123 ready");
  });
});
