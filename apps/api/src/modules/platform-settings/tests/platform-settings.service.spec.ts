import { PlatformSettingsRepository } from "../repositories/platform-settings.repository";
import { PlatformSettingsService } from "../services/platform-settings.service";
import { PlatformSettingsValidator } from "../validators/platform-settings.validator";

describe("PlatformSettingsService", () => {
  it("returns and updates platform settings", () => {
    const service = new PlatformSettingsService(
      new PlatformSettingsRepository(),
      new PlatformSettingsValidator(),
    );
    const updated = service.updateSetting("brand.name", { value: "Vriddhi Nexus Enterprise" });

    expect(service.getSettings().general.currency).toBe("INR");
    expect(updated.value).toBe("Vriddhi Nexus Enterprise");
  });
});
