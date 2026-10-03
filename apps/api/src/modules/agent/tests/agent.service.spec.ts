import { ForbiddenException } from "@nestjs/common";

import {
  bookingRequest,
  createBookingHarness,
  futureDate,
  principal,
  searchTrip,
} from "../../../shared/tests/booking-harness";
import { CustomerMapper } from "../../customer/mappers/customer.mapper";
import { CustomerRepository } from "../../customer/repositories/customer.repository";
import { CustomerService } from "../../customer/services/customer.service";
import { CustomerModuleValidator } from "../../customer/validators/customer.validator";
import { AgentMapper } from "../mappers/agent.mapper";
import { AgentRepository } from "../repositories/agent.repository";
import { AgentService } from "../services/agent.service";
import { AgentModuleValidator } from "../validators/agent.validator";

function createAgentService() {
  const harness = createBookingHarness();
  const service = new AgentService(
    new AgentRepository(harness.prisma.asPrismaService()),
    new AgentModuleValidator(),
    new AgentMapper(),
    harness.bookingService,
    new CustomerService(
      new CustomerRepository(),
      new CustomerModuleValidator(),
      new CustomerMapper(),
      harness.bookingService,
    ),
    harness.notificationService,
  );

  return { ...harness, service };
}

describe("AgentService", () => {
  it("returns module readiness and capabilities", () => {
    const summary = createAgentService().service.getSummary();

    expect(summary.module).toBe("agent");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("builds the dashboard from the signed-in agent and their own bookings", async () => {
    const harness = createAgentService();
    const user = harness.prisma.addUser({
      firstName: "Ravi",
      lastName: "Kumar",
      roleCode: "TRAVEL_AGENT",
    });
    const agent = principal({ sub: user.id, roles: ["TRAVEL_AGENT"] });
    const journeyDate = futureDate();
    const trip = await searchTrip(harness.supplierManager, journeyDate);
    await harness.bookingService.createBooking(bookingRequest(trip, journeyDate), agent, {
      channel: "AGENT",
      agentId: user.id,
    });

    const dashboard = await harness.service.getDashboard(agent);

    expect(dashboard.profile.contactName).toBe("Ravi Kumar");
    expect(dashboard.profile.status).toBe("ACTIVE");
    expect(dashboard.metrics.todaysBookings).toBe(1);
    expect(dashboard.metrics.upcomingJourneys).toBe(1);
    expect(dashboard.popularRoutes[0]?.route).toBe("Bangalore to Hyderabad");
    expect(dashboard.bookingStatusSummary).toEqual([{ status: "TICKET_GENERATED", count: 1 }]);
  });

  it("starts an agent with an empty dashboard rather than sample figures", async () => {
    const harness = createAgentService();
    const user = harness.prisma.addUser({ roleCode: "TRAVEL_AGENT" });

    const dashboard = await harness.service.getDashboard(
      principal({ sub: user.id, roles: ["TRAVEL_AGENT"] }),
    );

    expect(dashboard.popularRoutes).toEqual([]);
    expect(dashboard.bookingStatusSummary).toEqual([]);
    expect(dashboard.recentActivity).toEqual([]);
  });

  it("refuses an agent whose agency is still under review", async () => {
    const harness = createAgentService();
    const user = harness.prisma.addUser({
      roleCode: "TRAVEL_AGENT",
      agent: {
        id: "agency-1",
        agencyName: "Pending Travels",
        agencyAddress: null,
        contactName: "Pending",
        phone: "+910000000001",
        logoUrl: null,
        status: "PENDING_REVIEW",
        commissionRate: 0,
        emailPreferences: {},
        notificationPreferences: {},
      },
    });

    await expect(
      harness.service.getDashboard(principal({ sub: user.id, roles: ["TRAVEL_AGENT"] })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
