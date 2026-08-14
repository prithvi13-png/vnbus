import { SupplierRepository } from "../repositories/supplier.repository";
import { SupplierService } from "../services/supplier.service";
import { SupplierModuleValidator } from "../validators/supplier.validator";

describe("SupplierService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new SupplierService(new SupplierRepository(), new SupplierModuleValidator());
    const summary = service.getSummary();

    expect(summary.module).toBe("supplier");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });
});
