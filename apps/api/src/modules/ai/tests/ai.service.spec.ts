import { createTestSupplierManager } from "../../integration/tests/integration-test-helpers";
import { TripCacheService } from "../../integration/services/trip-cache.service";
import { AiRepository } from "../repositories/ai.repository";
import { AiService } from "../services/ai.service";
import { AiModuleValidator } from "../validators/ai.validator";

describe("AiService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new AiService(
      new AiRepository(new TripCacheService()),
      new AiModuleValidator(),
    );
    const summary = service.getSummary();

    expect(summary.module).toBe("ai");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("suggests nothing for a route nobody has searched", () => {
    const service = new AiService(
      new AiRepository(new TripCacheService()),
      new AiModuleValidator(),
    );
    const response = service.getRecommendations({ sourceCity: "Pune", destinationCity: "Goa" });

    expect(response.engine).toBe("RULES");
    expect(response.recommendations).toEqual([]);
    expect(response.trendingRoutes).toEqual([]);
  });

  it("suggests the cheapest and fastest of the buses a search returned", async () => {
    const cache = new TripCacheService();
    const service = new AiService(new AiRepository(cache), new AiModuleValidator());
    const manager = createTestSupplierManager();
    const response = await manager.searchTrips({
      sourceCity: "Bangalore",
      destinationCity: "Hyderabad",
      journeyDate: "2099-01-01",
      passengerCount: 1,
    });
    cache.remember(response.trips);
    service.recordRecentlyViewed({ sourceCity: "Bangalore", destinationCity: "Mysore" });

    const recommendations = service.getRecommendations({
      sourceCity: "Bangalore",
      destinationCity: "Hyderabad",
    });

    expect(recommendations.recommendations.map((item) => item.type)).toEqual([
      "CHEAPEST_ROUTE",
      "FASTEST_ROUTE",
    ]);
    expect(recommendations.recentlyViewed[0]?.route).toBe("Bangalore to Mysore");
    expect(recommendations.architecture.modelProvider).toBe("NONE");
  });
});
