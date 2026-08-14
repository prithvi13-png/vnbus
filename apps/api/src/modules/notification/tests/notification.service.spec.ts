import { NotificationRepository } from "../repositories/notification.repository";
import { NotificationService } from "../services/notification.service";
import { NotificationModuleValidator } from "../validators/notification.validator";

describe("NotificationService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new NotificationService(
      new NotificationRepository(),
      new NotificationModuleValidator(),
    );
    const summary = service.getSummary();

    expect(summary.module).toBe("notification");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("creates unread notifications and marks them read", () => {
    const service = new NotificationService(
      new NotificationRepository(),
      new NotificationModuleValidator(),
    );

    const notification = service.create({
      type: "BOOKING_UPDATE",
      title: "Ticket generated",
      body: "Your ticket is ready.",
      channel: "EMAIL",
      bookingId: "BKG-1",
    });
    const read = service.markRead(notification.id);

    expect(service.listNotifications().map((item) => item.id)).toContain(notification.id);
    expect(notification.readStatus).toBe("UNREAD");
    expect(notification.channel).toBe("EMAIL");
    expect(read.readStatus).toBe("READ");
  });

  it("supports unread, archive, mark-all-read, delete, and history actions", () => {
    const service = new NotificationService(
      new NotificationRepository(),
      new NotificationModuleValidator(),
    );
    const notification = service.create({
      type: "JOURNEY_REMINDER",
      title: "Journey reminder",
      body: "Your bus departs soon.",
    });
    const archived = service.archive(notification.id);
    const center = service.markAllRead();
    const afterDelete = service.delete(notification.id);

    expect(service.getNotificationCenter().history.length).toBeGreaterThanOrEqual(2);
    expect(archived.readStatus).toBe("ARCHIVED");
    expect(center.counts.unread).toBe(0);
    expect(afterDelete.history.map((item) => item.id)).not.toContain(notification.id);
  });

  it("supports the admin notification center", () => {
    const service = new NotificationService(
      new NotificationRepository(),
      new NotificationModuleValidator(),
    );
    const sent = service.sendAdminNotification({
      audience: "BROADCAST",
      title: "Maintenance",
      body: "Mock maintenance broadcast.",
    });
    const center = service.getAdminCenter();

    expect(sent.type).toBe("ADMIN_BROADCAST");
    expect(center.templates.length).toBeGreaterThan(0);
    expect(center.queue.queued).toBeGreaterThan(0);
  });
});
