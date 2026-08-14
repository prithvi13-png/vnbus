import { AgentNotificationMapper } from "../mappers/agent-notification.mapper";
import { AgentNotificationRepository } from "../repositories/agent-notification.repository";
import { AgentNotificationService } from "../services/agent-notification.service";
import { AgentNotificationValidator } from "../validators/agent-notification.validator";

describe("AgentNotificationService", () => {
  it("merges seed and shared notifications with read-state filtering", () => {
    const service = new AgentNotificationService(
      new AgentNotificationRepository(),
      new AgentNotificationValidator(),
      {
        listNotifications: () => [
          {
            id: "NTF-LIVE-001",
            type: "AGENT_BOOKING_CREATED",
            readStatus: "UNREAD",
            title: "Booking created",
            body: "Agent booking was created.",
            createdAt: "2026-08-08T09:00:00.000Z",
            readAt: null,
          },
        ],
      } as never,
      new AgentNotificationMapper(),
    );

    expect(service.listNotifications()).toHaveLength(3);
    expect(service.listNotifications("UNREAD").every((item) => item.readStatus === "UNREAD")).toBe(
      true,
    );
  });
});
