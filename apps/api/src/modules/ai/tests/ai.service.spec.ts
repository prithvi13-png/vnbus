import { AiRepository } from "../repositories/ai.repository";
import { AiService } from "../services/ai.service";
import { AiModuleValidator } from "../validators/ai.validator";

describe("AiService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new AiService(new AiRepository(), new AiModuleValidator());
    const summary = service.getSummary();

    expect(summary.module).toBe("ai");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("returns mock trip recommendations and recently viewed routes", () => {
    const service = new AiService(new AiRepository(), new AiModuleValidator());
    const updated = service.recordRecentlyViewed({
      sourceCity: "Bangalore",
      destinationCity: "Mysore",
    });
    const response = service.getRecommendations({
      sourceCity: "Bangalore",
      destinationCity: "Hyderabad",
    });

    expect(response.engine).toBe("MOCK_RULES");
    expect(response.recommendations.map((item) => item.type)).toContain("CHEAPEST_ROUTE");
    expect(response.recommendations.map((item) => item.type)).toContain("TRENDING_ROUTE");
    expect(updated.recentlyViewed[0]?.type).toBe("RECENTLY_VIEWED_ROUTE");
    expect(response.architecture.modelProvider).toBe("NONE");
  });
});
