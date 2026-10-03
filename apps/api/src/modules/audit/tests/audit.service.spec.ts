import type { PrismaService } from "../../../shared/prisma/prisma.service";
import { AuditRepository } from "../repositories/audit.repository";
import { AuditService } from "../services/audit.service";
import { AuditModuleValidator } from "../validators/audit.validator";

function createService(rows: unknown[] = []) {
  const findMany = jest.fn().mockResolvedValue(rows);
  const prisma = { activityLog: { findMany } } as unknown as PrismaService;

  return {
    findMany,
    service: new AuditService(new AuditRepository(prisma), new AuditModuleValidator()),
  };
}

describe("AuditService", () => {
  it("returns module readiness and capabilities", () => {
    const summary = createService().service.getSummary();

    expect(summary.module).toBe("audit");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("reads the activity log, filtered and newest first", async () => {
    const createdAt = new Date("2026-10-01T10:00:00.000Z");
    const { findMany, service } = createService([
      {
        id: "log-1",
        actorType: "USER",
        actor: { email: "admin@test.invalid" },
        action: "booking.cancelled",
        entityType: "booking",
        entityId: "booking-1",
        ipAddress: "10.0.0.1",
        userAgent: "Chrome",
        metadata: null,
        createdAt,
      },
    ]);

    const logs = await service.listLogs({ entityType: "booking", limit: 10 });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { entityType: "booking" },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    );
    expect(logs).toEqual([
      {
        auditId: "log-1",
        actor: "admin@test.invalid",
        action: "booking.cancelled",
        entityType: "booking",
        entityId: "booking-1",
        ipAddress: "10.0.0.1",
        userAgent: "Chrome",
        metadata: {},
        createdAt: createdAt.toISOString(),
      },
    ]);
  });
});
