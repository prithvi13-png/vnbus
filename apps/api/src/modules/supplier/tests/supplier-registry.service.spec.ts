import { SupplierRegistryService } from "../services/supplier-registry.service";

describe("SupplierRegistryService", () => {
  it("registers all supplier adapters", () => {
    const registry = new SupplierRegistryService();
    const codes = registry.listAdapters().map((adapter) => adapter.code);

    expect(codes).toEqual(["MOCK", "BCI", "REDBUS", "ABHIBUS", "TBO", "CUSTOM"]);
  });
});
