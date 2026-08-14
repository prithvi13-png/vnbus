import { Injectable } from "@nestjs/common";
import type {
  AgentBookingListQuery,
  AgentBookingListResponse,
  AgentBookingRecord,
  AgentEmailTicketRequest,
  CreateAgentBookingRequest,
  CreateAgentBookingResponse,
  TicketEmailResponse,
  TicketRecord,
} from "@vnbus/types";

import { AgentService } from "../../agent/services/agent.service";
import { BookingService } from "../../booking/services/booking.service";
import { CustomerService } from "../../customer/services/customer.service";
import { TicketService } from "../../ticket/services/ticket.service";
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

  listBookings(query: AgentBookingListQuery = {}): AgentBookingListResponse {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const filtered = this.bookingService
      .listBookings()
      .filter(
        (booking) => booking.channel === "AGENT" || this.repository.ownsBooking(booking.bookingId),
      )
      .map((booking): AgentBookingRecord => {
        const customer = booking.customerId
          ? this.customerService.getCustomer(booking.customerId)
          : this.customerService.findByPhoneOrEmail(
              booking.passengers[0]?.phone ?? "",
              booking.passengers[0]?.email ?? "",
            );
        const ticket = safeTicket(() => this.ticketService.getTicket(booking.bookingId));

        return this.mapper.toEntity(booking, customer, ticket);
      })
      .filter((record) => matchesQuery(record, query))
      .sort((left, right) => compareBookings(left, right, query));

    return {
      bookings: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
  }

  async createBooking(request: CreateAgentBookingRequest): Promise<CreateAgentBookingResponse> {
    const customer = this.customerService.ensureBookable(request.customerId);
    const created = await this.bookingService.createBooking(request);
    this.validator.ensureBookingCreated(created);
    const confirmation = await this.bookingService.confirmBooking({
      bookingId: created.bookingId,
      paymentReference: request.paymentReference ?? "AGENT-MOCK-PAYMENT",
    });
    const booking = this.bookingService.upsertBooking({
      ...confirmation.booking,
      channel: "AGENT",
      agentId: "AGT-VN-001",
      customerId: customer.customerId,
    });

    this.repository.recordBooking(booking.bookingId);
    this.customerService.recordBooking(customer.customerId, booking);
    this.agentService.recordActivity({
      type: "BOOKING_CREATED",
      title: "Agent booking created",
      description: `${booking.bookingReference} generated for ${customer.name}.`,
      actor: "Agent",
    });

    let emailLogId: string | undefined;
    if (request.emailTicket !== false) {
      const email = await this.ticketService.emailTicket({
        bookingId: booking.bookingId,
        to: customer.email,
      });
      emailLogId = email.emailLogId;
    }

    return {
      booking,
      ticket: confirmation.ticket,
      customer,
      ...(emailLogId ? { emailLogId } : {}),
    };
  }

  async emailTicket(request: AgentEmailTicketRequest): Promise<TicketEmailResponse> {
    const booking = this.bookingService.getBooking(request.bookingId);
    this.validator.ensureCanEmailTicket(booking);
    const response = await this.ticketService.emailTicket(request);
    this.agentService.recordActivity({
      type: "TICKET_EMAILED",
      title: "Ticket emailed",
      description: `${booking.bookingReference} ticket emailed from the agent workspace.`,
      actor: request.agentId ?? "Agent",
    });

    return response;
  }
}

function safeTicket(getTicket: () => TicketRecord): TicketRecord | null {
  try {
    return getTicket();
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
