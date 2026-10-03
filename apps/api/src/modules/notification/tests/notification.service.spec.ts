import { NotFoundException } from "@nestjs/common";

import { NotificationRepository } from "../repositories/notification.repository";
import { NotificationService } from "../services/notification.service";
import { NotificationModuleValidator } from "../validators/notification.validator";

const userId = "user-1";
const otherUserId = "user-2";

function createService(): NotificationService {
  return new NotificationService(new NotificationRepository(), new NotificationModuleValidator());
}

describe("NotificationService", () => {
  it("returns module readiness and capabilities", () => {
    const summary = createService().getSummary();

    expect(summary.module).toBe("notification");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("starts empty", () => {
    expect(createService().listNotifications(userId)).toEqual([]);
  });

  it("creates unread notifications for one user and marks them read", () => {
    const service = createService();

    const notification = service.create({
      userId,
      type: "BOOKING_UPDATE",
      title: "Ticket generated",
      body: "Your ticket is ready.",
      channel: "EMAIL",
      bookingId: "booking-1",
    });
    const read = service.markRead(notification.id, userId);

    expect(service.listNotifications(userId).map((item) => item.id)).toContain(notification.id);
    expect(notification.readStatus).toBe("UNREAD");
    expect(notification.channel).toBe("EMAIL");
    expect(read.readStatus).toBe("READ");
  });

  it("keeps a user's notifications from everyone else", () => {
    const service = createService();
    const notification = service.create({
      userId,
      type: "BOOKING_UPDATE",
      title: "Ticket generated",
      body: "PNR 123 for Asha Rao.",
    });

    expect(service.listNotifications(otherUserId)).toEqual([]);
    expect(() => service.markRead(notification.id, otherUserId)).toThrow(NotFoundException);
  });

  it("supports unread, archive, mark-all-read, delete, and history actions", () => {
    const service = createService();
    service.create({ userId, type: "BOOKING_UPDATE", title: "First", body: "One." });
    const notification = service.create({
      userId,
      type: "JOURNEY_REMINDER",
      title: "Journey reminder",
      body: "Your bus departs soon.",
    });
    const archived = service.archive(notification.id, userId);
    const center = service.markAllRead(userId);
    const afterDelete = service.delete(notification.id, userId);

    expect(archived.readStatus).toBe("ARCHIVED");
    expect(center.counts.unread).toBe(0);
    expect(afterDelete.history.map((item) => item.id)).not.toContain(notification.id);
  });

  it("shows an admin broadcast to every user", () => {
    const service = createService();
    const sent = service.sendAdminNotification({
      audience: "BROADCAST",
      title: "Maintenance",
      body: "Planned maintenance tonight.",
    });
    const center = service.getAdminCenter();

    expect(sent.type).toBe("ADMIN_BROADCAST");
    expect(service.listNotifications(userId).map((item) => item.id)).toContain(sent.id);
    expect(service.listNotifications(otherUserId).map((item) => item.id)).toContain(sent.id);
    expect(center.templates).toEqual([]);
    expect(center.queue.sent).toBe(1);
  });
});
