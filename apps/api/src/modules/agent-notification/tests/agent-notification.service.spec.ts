import { NotificationRepository } from "../../notification/repositories/notification.repository";
import { NotificationService } from "../../notification/services/notification.service";
import { NotificationModuleValidator } from "../../notification/validators/notification.validator";
import { AgentNotificationMapper } from "../mappers/agent-notification.mapper";
import { AgentNotificationRepository } from "../repositories/agent-notification.repository";
import { AgentNotificationService } from "../services/agent-notification.service";
import { AgentNotificationValidator } from "../validators/agent-notification.validator";

describe("AgentNotificationService", () => {
  it("lists the agent's own notifications, filtered by read state", () => {
    const notifications = new NotificationService(
      new NotificationRepository(),
      new NotificationModuleValidator(),
    );
    const service = new AgentNotificationService(
      new AgentNotificationRepository(),
      new AgentNotificationValidator(),
      notifications,
      new AgentNotificationMapper(),
    );
    const mine = notifications.create({
      userId: "agent-1",
      type: "AGENT_BOOKING_CREATED",
      title: "Booking created",
      body: "Agent booking was created.",
    });
    notifications.create({
      userId: "agent-2",
      type: "AGENT_BOOKING_CREATED",
      title: "Someone else's booking",
      body: "Not for agent-1.",
    });
    notifications.markRead(mine.id, "agent-1");

    expect(service.listNotifications("agent-1").map((item) => item.id)).toEqual([mine.id]);
    expect(service.listNotifications("agent-1", "UNREAD")).toEqual([]);
  });
});
