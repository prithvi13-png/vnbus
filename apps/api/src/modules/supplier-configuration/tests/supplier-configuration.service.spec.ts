import { testConfig } from "../../../shared/tests/booking-harness";
import { IntegrationConfigurationService } from "../../integration/services/integration-configuration.service";
import { SupplierConfigurationRepository } from "../repositories/supplier-configuration.repository";
import { SupplierConfigurationService } from "../services/supplier-configuration.service";
import { SupplierConfigurationValidator } from "../validators/supplier-configuration.validator";

describe("SupplierConfigurationService", () => {
  it("lists suppliers as the environment configures them and keeps admin edits", () => {
    const service = new SupplierConfigurationService(
      new SupplierConfigurationRepository(new IntegrationConfigurationService(testConfig())),
      new SupplierConfigurationValidator(),
    );
    const srdv = service.list().find((item) => item.code === "SRDV");
    const updated = service.update("REDBUS", { enabled: true, priority: 1 });

    expect(srdv).toMatchObject({ enabled: true, healthStatus: "HEALTHY" });
    expect(service.list().find((item) => item.code === "BCI")?.enabled).toBe(false);
    expect(updated.enabled).toBe(true);
    expect(service.list().some((item) => (item.code as string) === "MOCK")).toBe(false);
  });
});
