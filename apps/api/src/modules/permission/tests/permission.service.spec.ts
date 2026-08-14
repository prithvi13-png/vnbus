import { PermissionService } from "../services/permission.service";
import type { PermissionRepository } from "../repositories/permission.repository";

describe("PermissionService", () => {
  it("returns database permissions", async () => {
    const repository = {
      findMany: jest.fn().mockResolvedValue([
        {
          id: "permission-1",
          code: "users.view",
          description: "users.view permission",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    } as unknown as jest.Mocked<PermissionRepository>;
    const service = new PermissionService(repository);

    await expect(service.list()).resolves.toEqual([
      expect.objectContaining({
        code: "users.view",
      }),
    ]);
  });
});
