import { ActivityService } from "../services/activity.service";
import type { ActivityRepository } from "../repositories/activity.repository";
import { ActivityValidator } from "../validators/activity.validator";

describe("ActivityService", () => {
  it("records valid activity input", async () => {
    const repository = {
      create: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<ActivityRepository>;
    const service = new ActivityService(repository, new ActivityValidator());

    await service.record({
      actorType: "SYSTEM",
      action: "auth.login",
      message: "User login",
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "auth.login",
      }),
    );
  });

  it("lists activity with admin device and browser metadata", async () => {
    const repository = {
      findMany: jest.fn().mockResolvedValue([
        {
          id: "activity-1",
          actorType: "USER",
          actorUserId: "user-1",
          action: "user.login",
          message: "User login",
          entityType: "user",
          entityId: "user-1",
          ipAddress: "127.0.0.1",
          userAgent: "Mozilla/5.0 Chrome/126",
          requestId: null,
          metadata: null,
          createdAt: new Date("2026-08-08T08:00:00.000Z"),
        },
      ]),
    } as unknown as jest.Mocked<ActivityRepository>;
    const service = new ActivityService(repository, new ActivityValidator());

    await expect(service.list({ limit: 10 })).resolves.toEqual([
      expect.objectContaining({
        ipAddress: "127.0.0.1",
        device: "Desktop",
        browser: "Chrome",
      }),
    ]);
  });
});
