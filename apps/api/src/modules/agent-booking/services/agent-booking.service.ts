import { Injectable } from "@nestjs/common";
import type {
  AgentBookingListQuery,
  AgentBookingListResponse,
  AgentBookingRecord,
  AgentEmailTicketRequest,
  CreateAgentBookingResponse,
  TicketEmailResponse,
  TicketRecord,
} from "@vnbus/types";

import type { JwtPrincipal } from "../../../shared/security/interfaces/jwt-principal.interface";
import { AgentService } from "../../agent/services/agent.service";
import { BookingService } from "../../booking/services/booking.service";
import { CustomerService } from "../../customer/services/customer.service";
import { TicketService } from "../../ticket/services/ticket.service";
import type { CreateAgentBookingDto } from "../dto/agent-booking.dto";
import { AgentBookingMapper } from "../mappers/agent-booking.mapper";
import { AgentBookingRepository } from "../repositories/agent-booking.repository";
import { AgentBookingValidator } from "../validators/agent-booking.validator";

@Injectable()
export class AgentBookingService {
  constructor(
    private readonly repository: AgentBookingRepository,
    private readonly validator: AgentBookingValidator,
    private readonly bookingService: BookingService,
    private readonly ticketService: TicketService,
    private readonly customerService: CustomerService,
    private readonly agentService: AgentService,
    private readonly mapper: AgentBookingMapper,
  ) {}

  /** The signed-in agent's own bookings. */
  async listBookings(
    principal: JwtPrincipal,
    query: AgentBookingListQuery = {},
  ): Promise<AgentBookingListResponse> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const bookings = await this.bookingService.listBookings(principal);
    const records = await Promise.all(
      bookings.map(async (booking): Promise<AgentBookingRecord> => {
        const customer = booking.customerId
          ? this.customerService.getCustomer(principal, booking.customerId)
          : this.customerService.findByPhoneOrEmail(
              principal,
              booking.passengers[0]?.phone ?? "",
              booking.passengers[0]?.email ?? "",
            );
        const ticket = await safeTicket(() =>
          this.ticketService.getTicket(booking.bookingId, principal),
        );

        return this.mapper.toEntity(booking, customer, ticket);
      }),
    );
    const filtered = records
      .filter((record) => matchesQuery(record, query))
      .sort((left, right) => compareBookings(left, right, query));

    return {
      bookings: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
  }

  /**
   * Books for one of the agent's customers through the same supplier flow as
   * a traveller's own booking, owned by the agent's account.
   */
  async createBooking(
    principal: JwtPrincipal,
    request: CreateAgentBookingDto,
  ): Promise<CreateAgentBookingResponse> {
    const customer = this.customerService.ensureBookable(principal, request.customerId);
    const confirmation = await this.bookingService.createBooking(request, principal, {
      channel: "AGENT",
      agentId: principal.sub,
      customerId: customer.customerId,
    });
    const booking = confirmation.booking;

    this.validator.ensureBookingCreated(booking);
    this.customerService.recordBooking(principal, customer.customerId, booking);
    this.agentService.recordActivity(principal, {
      type: "BOOKING_CREATED",
      title: "Agent booking created",
      description: `${booking.bookingReference} booked for ${customer.name}.`,
      actor: principal.email,
    });

    let emailLogId: string | undefined;
    if (request.emailTicket !== false) {
      const email = await this.ticketService.emailTicket(
        { bookingId: booking.bookingId, to: customer.email },
        principal,
      );
      emailLogId = email.emailLogId;
    }

    return {
      booking,
      ticket: confirmation.ticket,
      customer,
      ...(emailLogId ? { emailLogId } : {}),
    };
  }

  async emailTicket(
    principal: JwtPrincipal,
    request: AgentEmailTicketRequest,
  ): Promise<TicketEmailResponse> {
    const booking = await this.bookingService.getBookingForUser(request.bookingId, principal);
    this.validator.ensureCanEmailTicket(booking);
    const response = await this.ticketService.emailTicket(request, principal);
    this.agentService.recordActivity(principal, {
      type: "TICKET_EMAILED",
      title: "Ticket emailed",
      description: `${booking.bookingReference} ticket emailed from the agent workspace.`,
      actor: principal.email,
    });

    return response;
  }
}

async function safeTicket(getTicket: () => Promise<TicketRecord>): Promise<TicketRecord | null> {
  try {
    return await getTicket();
  } catch {
    return null;
  }
}

function matchesQuery(record: AgentBookingRecord, query: AgentBookingListQuery): boolean {
  const booking = record.booking;
  const passenger = booking.passengers[0];
  const normalized = query.search?.trim().toLowerCase();
  const haystack = [
    booking.bookingId,
    booking.bookingReference,
    booking.trip.operatorName,
    booking.trip.sourceCity,
    booking.trip.destinationCity,
    booking.status,
    record.customer?.name,
    passenger?.phone,
    passenger?.email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    (!normalized || haystack.includes(normalized)) &&
    (!query.journeyDate || booking.trip.departureTime.startsWith(query.journeyDate)) &&
    (!query.operator ||
      booking.trip.operatorName.toLowerCase().includes(query.operator.toLowerCase())) &&
    (!query.status || booking.status === query.status) &&
    (!query.source || booking.trip.sourceCity.toLowerCase().includes(query.source.toLowerCase())) &&
    (!query.destination ||
      booking.trip.destinationCity.toLowerCase().includes(query.destination.toLowerCase())) &&
    (!query.bookingId ||
      booking.bookingId.toLowerCase().includes(query.bookingId.toLowerCase()) ||
      booking.bookingReference.toLowerCase().includes(query.bookingId.toLowerCase())) &&
    (!query.customerName ||
      (record.customer?.name.toLowerCase().includes(query.customerName.toLowerCase()) ?? false)) &&
    (!query.phoneNumber || (passenger?.phone.includes(query.phoneNumber) ?? false))
  );
}

function compareBookings(
  left: AgentBookingRecord,
  right: AgentBookingRecord,
  query: AgentBookingListQuery,
): number {
  const direction = query.sortDirection === "asc" ? 1 : -1;
  const sortBy = query.sortBy ?? "createdAt";
  const leftValue = sortValue(left, sortBy);
  const rightValue = sortValue(right, sortBy);

  return leftValue.localeCompare(rightValue) * direction;
}

function sortValue(
  record: AgentBookingRecord,
  sortBy: NonNullable<AgentBookingListQuery["sortBy"]>,
): string {
  if (sortBy === "journeyDate") {
    return record.booking.trip.departureTime;
  }
  if (sortBy === "amount") {
    return record.booking.fare.grandTotal.amount.toString().padStart(10, "0");
  }
  if (sortBy === "status") {
    return record.booking.status;
  }

  return record.booking.createdAt;
}
