import { ConflictException, UnauthorizedException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { JwtService } from "@nestjs/jwt";

import type { ActivityService } from "../../activity/services/activity.service";
import type { EmailTemplateService } from "../../../shared/email/email-template.service";
import type { AuthRepository } from "../repositories/auth.repository";
import { AuthService } from "../services/auth.service";
import type { PasswordService } from "../services/password.service";

describe("AuthService", () => {
  const user = {
    id: "user-1",
    firstName: "Aarav",
    lastName: "Sharma",
    email: "traveller@example.com",
    phone: "+919876543210",
    avatar: null,
    passwordHash: "hash",
    role: "CUSTOMER" as const,
    roles: ["CUSTOMER" as const],
    permissions: ["bookings.view"],
    status: "ACTIVE",
    emailVerified: true,
    forcePasswordChange: false,
  };

  const repository = {
    findByEmail: jest.fn(),
    phoneExists: jest.fn(),
    updateLastLogin: jest.fn(),
    persistRefreshToken: jest.fn(),
    createCustomerAccount: jest.fn(),
  } as unknown as jest.Mocked<AuthRepository>;

  const jwtService = {
    signAsync: jest
      .fn()
      .mockResolvedValueOnce("access-token")
      .mockResolvedValueOnce("refresh-token"),
  } as unknown as jest.Mocked<JwtService>;

  const passwordService = {
    verifyPassword: jest.fn(),
    hashToken: jest.fn().mockReturnValue("refresh-hash"),
  } as unknown as jest.Mocked<PasswordService>;

  const config = {
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string | number> = {
        JWT_REFRESH_SECRET: "refresh-secret-with-enough-length",
        JWT_REFRESH_TTL: "7d",
      };

      return values[key];
    }),
  } as unknown as jest.Mocked<ConfigService>;
  const email = {
    queue: jest.fn(),
  } as unknown as jest.Mocked<EmailTemplateService>;
  const activity = {
    record: jest.fn(),
  } as unknown as jest.Mocked<ActivityService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("issues tokens after a valid login", async () => {
    repository.findByEmail.mockResolvedValue(user);
    passwordService.verifyPassword.mockResolvedValue(true);

    const service = new AuthService(
      repository,
      jwtService,
      passwordService,
      config,
      email,
      activity,
    );
    const response = await service.login({
      email: "Traveller@Example.com",
      password: "VNexus#2026Pass",
    });

    expect(repository.findByEmail).toHaveBeenCalledWith("traveller@example.com");
    expect(repository.updateLastLogin).toHaveBeenCalledWith("user-1");
    expect(repository.persistRefreshToken).toHaveBeenCalled();
    expect(response.user.roles).toEqual(["CUSTOMER"]);
  });

  it("rejects an invalid password", async () => {
    repository.findByEmail.mockResolvedValue(user);
    passwordService.verifyPassword.mockResolvedValue(false);

    const service = new AuthService(
      repository,
      jwtService,
      passwordService,
      config,
      email,
      activity,
    );

    await expect(
      service.login({
        email: "traveller@example.com",
        password: "wrong-password",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects a registration whose phone number is already taken", async () => {
    // The phone column is unique, so without this check the insert fails and the
    // caller gets a 500 instead of being told which field to change.
    repository.findByEmail.mockResolvedValue(null);
    repository.phoneExists.mockResolvedValue(true);

    const service = new AuthService(
      repository,
      jwtService,
      passwordService,
      config,
      email,
      activity,
    );

    await expect(
      service.registerCustomer({
        firstName: "Aarav",
        lastName: "Sharma",
        email: "someone.else@example.com",
        password: "VNexus#2026Pass",
        confirmPassword: "VNexus#2026Pass",
        phone: "+919876543210",
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(repository.phoneExists).toHaveBeenCalledWith("+919876543210");
    expect(repository.createCustomerAccount).not.toHaveBeenCalled();
  });
});
