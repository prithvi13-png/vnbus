import { CustomerRepository } from "../repositories/customer.repository";
import { CustomerService } from "../services/customer.service";
import { CustomerMapper } from "../mappers/customer.mapper";
import { CustomerModuleValidator } from "../validators/customer.validator";

describe("CustomerService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new CustomerService(
      new CustomerRepository(),
      new CustomerModuleValidator(),
      new CustomerMapper(),
    );
    const summary = service.getSummary();

    expect(summary.module).toBe("customer");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("creates, updates, searches, and deletes agent customers", () => {
    const service = new CustomerService(
      new CustomerRepository(),
      new CustomerModuleValidator(),
      new CustomerMapper(),
    );
    const created = service.createCustomer({
      name: "Test Traveller",
      email: "test.traveller@example.com",
      phone: "+919900000001",
      gender: "OTHER",
      preferredRoutes: ["Bangalore to Hyderabad"],
      tags: ["VIP"],
      notes: "Needs aisle access.",
    });

    expect(created.status).toBe("VIP");
    expect(service.listCustomers({ search: "traveller" }).total).toBeGreaterThan(0);

    const updated = service.updateCustomer(created.customerId, {
      notes: "Prefers morning departures.",
      status: "ACTIVE",
    });
    expect(updated.notes).toHaveLength(2);
    expect(updated.status).toBe("ACTIVE");

    expect(service.deleteCustomer(created.customerId).deleted).toBe(true);
  });

  it("rejects duplicate customers", () => {
    const service = new CustomerService(
      new CustomerRepository(),
      new CustomerModuleValidator(),
      new CustomerMapper(),
    );

    expect(() =>
      service.createCustomer({
        name: "Duplicate",
        email: "aarav.sharma@example.com",
        phone: "+919999999999",
        gender: "MALE",
      }),
    ).toThrow("Duplicate customer");
  });
});
