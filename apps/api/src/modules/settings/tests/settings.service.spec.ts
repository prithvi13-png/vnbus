import { SettingsRepository } from "../repositories/settings.repository";
import { SettingsService } from "../services/settings.service";
import { SettingsModuleValidator } from "../validators/settings.validator";

describe("SettingsService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new SettingsService(new SettingsRepository(), new SettingsModuleValidator());
    const summary = service.getSummary();

    expect(summary.module).toBe("settings");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });
});
