import { NotFoundException } from "@nestjs/common";

import type { ActivityService } from "../../activity/services/activity.service";
import { ProfileService } from "../services/profile.service";
import type { ProfileRepository } from "../repositories/profile.repository";
import { ProfileValidator } from "../validators/profile.validator";

const profileRecord = {
  id: "user-1",
  firstName: "Aarav",
  lastName: "Sharma",
  email: "traveller@example.com",
  phone: "+919876543210",
  avatar: null,
  roleId: "role-1",
  passwordHash: "hash",
  status: "ACTIVE",
  emailVerified: true,
  emailVerifiedAt: new Date(),
  lastLoginAt: null,
  forcePasswordChange: false,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  role: {
    id: "role-1",
    code: "CUSTOMER",
    name: "Customer",
    description: null,
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    permissions: [{ permission: { code: "profile.view" } }],
  },
  roles: [],
};

describe("ProfileService", () => {
  const repository = {
    findByUserId: jest.fn(),
    update: jest.fn(),
  } as unknown as jest.Mocked<ProfileRepository>;
  const activity = {
    record: jest.fn(),
  } as unknown as jest.Mocked<ActivityService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the current profile", async () => {
    repository.findByUserId.mockResolvedValue(profileRecord as never);
    const service = new ProfileService(repository, new ProfileValidator(), activity);

    await expect(service.get("user-1")).resolves.toEqual(
      expect.objectContaining({
        email: "traveller@example.com",
        permissions: ["profile.view"],
      }),
    );
  });

  it("throws when the profile is missing", async () => {
    repository.findByUserId.mockResolvedValue(null);
    const service = new ProfileService(repository, new ProfileValidator(), activity);

    await expect(service.get("missing")).rejects.toBeInstanceOf(NotFoundException);
  });
});
