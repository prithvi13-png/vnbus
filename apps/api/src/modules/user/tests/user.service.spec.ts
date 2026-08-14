import { ConflictException, NotFoundException } from "@nestjs/common";

import type { ActivityService } from "../../activity/services/activity.service";
import type { PasswordService } from "../../auth/services/password.service";
import { UserService } from "../services/user.service";
import type { UserRepository } from "../repositories/user.repository";
import { UserValidator } from "../validators/user.validator";

const userRecord = {
  id: "user-1",
  firstName: "Meera",
  lastName: "Iyer",
  email: "meera@example.com",
  phone: "+919876543211",
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
    code: "ADMIN",
    name: "Admin",
    description: null,
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    permissions: [{ permission: { code: "users.view" } }],
  },
  roles: [],
};

describe("UserService", () => {
  const repository = {
    findMany: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByPhone: jest.fn(),
    findRoleByCode: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  } as unknown as jest.Mocked<UserRepository>;
  const passwordService = {
    hashPassword: jest.fn(),
  } as unknown as jest.Mocked<PasswordService>;
  const activity = {
    record: jest.fn(),
  } as unknown as jest.Mocked<ActivityService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a user with a database-backed role", async () => {
    repository.findByEmail.mockResolvedValue(null);
    repository.findByPhone.mockResolvedValue(null);
    repository.findRoleByCode.mockResolvedValue({ id: "role-1", code: "ADMIN" } as never);
    repository.create.mockResolvedValue(userRecord as never);
    passwordService.hashPassword.mockResolvedValue("hash");
    const service = new UserService(repository, passwordService, new UserValidator(), activity);

    const result = await service.create(
      {
        firstName: "Meera",
        lastName: "Iyer",
        email: "Meera@Example.com",
        phone: "+919876543211",
        password: "VNexus#2026Pass",
        confirmPassword: "VNexus#2026Pass",
        roleCode: "admin",
      },
      "admin-1",
    );

    expect(repository.findRoleByCode).toHaveBeenCalledWith("ADMIN");
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: "meera@example.com" }),
      "hash",
      "role-1",
    );
    expect(result.role).toBe("ADMIN");
  });

  it("rejects duplicate emails", async () => {
    repository.findByEmail.mockResolvedValue(userRecord as never);
    const service = new UserService(repository, passwordService, new UserValidator(), activity);

    await expect(
      service.create({
        firstName: "Meera",
        lastName: "Iyer",
        email: "meera@example.com",
        phone: "+919876543211",
        password: "VNexus#2026Pass",
        confirmPassword: "VNexus#2026Pass",
        roleCode: "ADMIN",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("returns not found for missing users", async () => {
    repository.findById.mockResolvedValue(null);
    const service = new UserService(repository, passwordService, new UserValidator(), activity);

    await expect(service.getById("missing")).rejects.toBeInstanceOf(NotFoundException);
  });
});
