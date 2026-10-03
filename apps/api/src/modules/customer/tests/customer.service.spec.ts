import { createBookingHarness, principal } from "../../../shared/tests/booking-harness";
import { CustomerMapper } from "../mappers/customer.mapper";
import { CustomerRepository } from "../repositories/customer.repository";
import { CustomerService } from "../services/customer.service";
import { CustomerModuleValidator } from "../validators/customer.validator";

function createService(): CustomerService {
  return new CustomerService(
    new CustomerRepository(),
    new CustomerModuleValidator(),
    new CustomerMapper(),
    createBookingHarness().bookingService,
  );
}

const agent = principal({ sub: "00000000-0000-4000-8000-0000000000a1", roles: ["TRAVEL_AGENT"] });
const otherAgent = principal({
  sub: "00000000-0000-4000-8000-0000000000a2",
  roles: ["TRAVEL_AGENT"],
});

describe("CustomerService", () => {
  it("returns module readiness and capabilities", () => {
    const summary = createService().getSummary();

    expect(summary.module).toBe("customer");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("starts with no customers", () => {
    expect(createService().listCustomers(agent).total).toBe(0);
  });

  it("creates, updates, searches, and deletes an agent's customers", () => {
    const service = createService();
    const created = service.createCustomer(agent, {
      name: "Test Traveller",
      email: "test.traveller@test.invalid",
      phone: "+919900000001",
      gender: "OTHER",
      preferredRoutes: [],
      tags: ["VIP"],
      notes: "Needs aisle access.",
    });

    expect(created.status).toBe("VIP");
    expect(service.listCustomers(agent, { search: "traveller" }).total).toBe(1);

    const updated = service.updateCustomer(agent, created.customerId, {
      notes: "Prefers morning departures.",
      status: "ACTIVE",
    });
    expect(updated.notes).toHaveLength(2);
    expect(updated.status).toBe("ACTIVE");

    expect(service.deleteCustomer(agent, created.customerId).deleted).toBe(true);
  });

  it("keeps each agent's customers to that agent", () => {
    const service = createService();
    const created = service.createCustomer(agent, {
      name: "Private Customer",
      email: "private@test.invalid",
      phone: "+919900000002",
      gender: "FEMALE",
    });

    expect(service.listCustomers(otherAgent).total).toBe(0);
    expect(service.getCustomer(otherAgent, created.customerId)).toBeNull();
  });

  it("rejects a duplicate in the same agent's list", () => {
    const service = createService();
    const customer = {
      name: "Duplicate",
      email: "duplicate@test.invalid",
      phone: "+919999999999",
      gender: "MALE" as const,
    };
    service.createCustomer(agent, customer);

    expect(() => service.createCustomer(agent, customer)).toThrow("Duplicate customer");
  });
});
