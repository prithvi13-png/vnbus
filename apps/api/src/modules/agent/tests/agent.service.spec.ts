import { AgentRepository } from "../repositories/agent.repository";
import { AgentService } from "../services/agent.service";
import { AgentMapper } from "../mappers/agent.mapper";
import { AgentModuleValidator } from "../validators/agent.validator";

describe("AgentService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new AgentService(
      new AgentRepository(),
      new AgentModuleValidator(),
      new AgentMapper(),
    );
    const summary = service.getSummary();

    expect(summary.module).toBe("agent");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("returns B2B dashboard widgets with mock fallbacks", () => {
    const service = new AgentService(
      new AgentRepository(),
      new AgentModuleValidator(),
      new AgentMapper(),
    );
    const dashboard = service.getDashboard();

    expect(dashboard.profile.agencyName).toContain("Vriddhi Nexus");
    expect(dashboard.popularRoutes.length).toBeGreaterThan(0);
    expect(dashboard.bookingStatusSummary.length).toBeGreaterThan(0);
  });
});
