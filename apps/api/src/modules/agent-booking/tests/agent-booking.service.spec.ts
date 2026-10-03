import {
  createBookingHarness,
  futureDate,
  principal,
  searchTrip,
} from "../../../shared/tests/booking-harness";
import { AgentMapper } from "../../agent/mappers/agent.mapper";
import { AgentRepository } from "../../agent/repositories/agent.repository";
import { AgentService } from "../../agent/services/agent.service";
import { AgentModuleValidator } from "../../agent/validators/agent.validator";
import { CustomerMapper } from "../../customer/mappers/customer.mapper";
import { CustomerRepository } from "../../customer/repositories/customer.repository";
import { CustomerService } from "../../customer/services/customer.service";
import { CustomerModuleValidator } from "../../customer/validators/customer.validator";
import { AgentBookingMapper } from "../mappers/agent-booking.mapper";
import { AgentBookingRepository } from "../repositories/agent-booking.repository";
import { AgentBookingService } from "../services/agent-booking.service";
import { AgentBookingValidator } from "../validators/agent-booking.validator";

function createAgentBooking() {
  const harness = createBookingHarness();
  const customerService = new CustomerService(
    new CustomerRepository(),
    new CustomerModuleValidator(),
    new CustomerMapper(),
    harness.bookingService,
  );
  const agentService = new AgentService(
    new AgentRepository(harness.prisma.asPrismaService()),
    new AgentModuleValidator(),
    new AgentMapper(),
    harness.bookingService,
    customerService,
    harness.notificationService,
  );
  const service = new AgentBookingService(
    new AgentBookingRepository(),
    new AgentBookingValidator(),
    harness.bookingService,
    harness.ticketService,
    customerService,
    agentService,
    new AgentBookingMapper(),
  );

  return { ...harness, customerService, service };
}

const agent = principal({ sub: "00000000-0000-4000-8000-0000000000a1", roles: ["TRAVEL_AGENT"] });

describe("AgentBookingService", () => {
  it("books for one of the agent's customers through the supplier", async () => {
    const harness = createAgentBooking();
    const customer = harness.customerService.createCustomer(agent, {
      name: "Meena Iyer",
      email: "meena@test.invalid",
      phone: "+919000000002",
      gender: "FEMALE",
    });
    const journeyDate = futureDate();
    const trip = await searchTrip(harness.supplierManager, journeyDate);

    const response = await harness.service.createBooking(agent, {
      supplierCode: trip.supplierCode,
      tripId: trip.tripId,
      journeyDate,
      selectedSeats: ["L1"],
      boardingPointId: "BP1",
      droppingPointId: "DP1",
      passengers: [
        {
          seatNumber: "L1",
          firstName: "Meena",
          lastName: "Iyer",
          age: 44,
          gender: "FEMALE",
          phone: customer.phone,
          email: customer.email,
        },
      ],
      customerId: customer.customerId,
      emailTicket: true,
    });

    expect(response.booking).toMatchObject({
      channel: "AGENT",
      agentId: agent.sub,
      customerId: customer.customerId,
      status: "TICKET_GENERATED",
      pnr: "PNR-TEST-1",
    });
    expect(response.emailLogId).toBeDefined();
    expect(harness.customerService.getCustomer(agent, customer.customerId)?.bookingCount).toBe(1);

    const list = await harness.service.listBookings(agent);
    expect(list.total).toBe(1);
    expect(list.bookings[0]?.customer?.name).toBe("Meena Iyer");
  });

  it("lists only the signed-in agent's bookings", async () => {
    const harness = createAgentBooking();

    expect(
      (
        await harness.service.listBookings(
          principal({ sub: "00000000-0000-4000-8000-0000000000a9", roles: ["TRAVEL_AGENT"] }),
        )
      ).total,
    ).toBe(0);
  });
});
