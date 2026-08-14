import { CacheRepository } from "../repositories/cache.repository";
import { CacheService } from "../services/cache.service";
import { CacheValidator } from "../validators/cache.validator";

describe("CacheService", () => {
  it("returns Redis cache strategy and warms namespaces", () => {
    const service = new CacheService(new CacheRepository(), new CacheValidator());
    const warmed = service.warm(["SEARCH_RESULTS", "ANALYTICS"]);

    expect(warmed.provider).toBe("REDIS");
    expect(warmed.warmedNamespaces).toContain("SEARCH_RESULTS");
    expect(warmed.warmedNamespaces).toContain("ANALYTICS");
    expect(warmed.strategy.map((item) => item.namespace)).toContain("FEATURE_FLAGS");
  });
});
