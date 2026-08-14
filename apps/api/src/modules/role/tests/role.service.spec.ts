import { RoleService } from "../services/role.service";
import type { RoleRepository } from "../repositories/role.repository";
import { RoleValidator } from "../validators/role.validator";

describe("RoleService", () => {
  it("maps roles with permissions", async () => {
    const repository = {
      findMany: jest.fn().mockResolvedValue([
        {
          id: "role-1",
          code: "ADMIN",
          name: "Admin",
          description: "Admin role",
          isSystem: true,
          permissions: [{ permission: { code: "users.view" } }],
        },
      ]),
    } as unknown as jest.Mocked<RoleRepository>;
    const service = new RoleService(repository, new RoleValidator());

    await expect(service.list()).resolves.toEqual([
      expect.objectContaining({
        code: "ADMIN",
        permissions: ["users.view"],
      }),
    ]);
  });

  it("creates and assigns dynamic role permissions", async () => {
    const role = {
      id: "role-2",
      code: "SUPPORT_MANAGER",
      name: "Support Manager",
      description: "Support role",
      isSystem: false,
      permissions: [{ permission: { code: "bookings.view" } }],
    };
    const repository = {
      create: jest.fn().mockResolvedValue(role),
      assignPermissions: jest.fn().mockResolvedValue({
        ...role,
        permissions: [
          { permission: { code: "bookings.view" } },
          { permission: { code: "tickets.view" } },
        ],
      }),
    } as unknown as jest.Mocked<RoleRepository>;
    const service = new RoleService(repository, new RoleValidator());
    const created = await service.create({
      code: "SUPPORT_MANAGER",
      name: "Support Manager",
      permissions: ["bookings.view"],
    });
    const assigned = await service.assignPermissions("SUPPORT_MANAGER", {
      permissionCodes: ["tickets.view"],
    });

    expect(created.code).toBe("SUPPORT_MANAGER");
    expect(assigned.permissions).toContain("tickets.view");
  });
});
