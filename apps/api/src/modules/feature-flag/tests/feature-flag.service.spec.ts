import { FeatureFlagRepository } from "../repositories/feature-flag.repository";
import { FeatureFlagService } from "../services/feature-flag.service";
import { FeatureFlagValidator } from "../validators/feature-flag.validator";

describe("FeatureFlagService", () => {
  it("lists and updates admin feature flags", () => {
    const service = new FeatureFlagService(new FeatureFlagRepository(), new FeatureFlagValidator());
    const flag = service.update("enable-maintenance-mode", {
      enabled: true,
      rolloutPercentage: 100,
    });

    expect(service.list().map((item) => item.key)).toContain("enable-agent-portal");
    expect(flag.enabled).toBe(true);
    expect(flag.rolloutPercentage).toBe(100);
  });
});
