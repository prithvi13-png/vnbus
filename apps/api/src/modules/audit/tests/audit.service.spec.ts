import { AuditRepository } from "../repositories/audit.repository";
import { AuditService } from "../services/audit.service";
import { AuditModuleValidator } from "../validators/audit.validator";

describe("AuditService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new AuditService(new AuditRepository(), new AuditModuleValidator());
    const summary = service.getSummary();

    expect(summary.module).toBe("audit");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("filters admin audit logs", () => {
    const service = new AuditService(new AuditRepository(), new AuditModuleValidator());
    const logs = service.listLogs({ entityType: "booking", limit: 10 });

    expect(logs).toHaveLength(1);
    expect(logs[0]?.action).toBe("booking.cancelled");
  });
});
