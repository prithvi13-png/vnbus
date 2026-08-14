import { SupplierConfigurationRepository } from "../repositories/supplier-configuration.repository";
import { SupplierConfigurationService } from "../services/supplier-configuration.service";
import { SupplierConfigurationValidator } from "../validators/supplier-configuration.validator";

describe("SupplierConfigurationService", () => {
  it("lists and updates supplier placeholders without API integration", () => {
    const service = new SupplierConfigurationService(
      new SupplierConfigurationRepository(),
      new SupplierConfigurationValidator(),
    );
    const updated = service.update("REDBUS", { enabled: true, priority: 1 });

    expect(service.list().map((item) => item.code)).toContain("BCI");
    expect(updated.enabled).toBe(true);
    expect(updated.apiKeySecretRef).toContain("encrypted-placeholder");
  });
});
