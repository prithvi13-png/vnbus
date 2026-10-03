import { Injectable } from "@nestjs/common";
import type {
  AgentCustomerDetailsResponse,
  AgentCustomerListQuery,
  AgentCustomerListResponse,
  AgentCustomerRecord,
  BookingRecord,
  CreateAgentCustomerRequest,
  UpdateAgentCustomerRequest,
} from "@vnbus/types";

import type { JwtPrincipal } from "../../../shared/security/interfaces/jwt-principal.interface";
import { BookingService } from "../../booking/services/booking.service";
import { CustomerSummaryDto } from "../dto/customer-summary.dto";
import type { CustomerModulePort } from "../interfaces/customer.interface";
import { CustomerMapper } from "../mappers/customer.mapper";
import { CustomerRepository } from "../repositories/customer.repository";
import { CustomerModuleValidator } from "../validators/customer.validator";

@Injectable()
export class CustomerService implements CustomerModulePort {
  constructor(
    private readonly repository: CustomerRepository,
    private readonly validator: CustomerModuleValidator,
    private readonly mapper: CustomerMapper,
    private readonly bookingService: BookingService,
  ) {}

  getSummary(): CustomerSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new CustomerSummaryDto(summary);
  }

  listCustomers(
    principal: JwtPrincipal,
    query: AgentCustomerListQuery = {},
  ): AgentCustomerListResponse {
    return this.repository.list(principal.sub, query);
  }

  getCustomer(principal: JwtPrincipal, customerId: string): AgentCustomerRecord | null {
    return this.repository.findById(principal.sub, customerId);
  }

  findByPhoneOrEmail(
    principal: JwtPrincipal,
    phone: string,
    email: string,
  ): AgentCustomerRecord | null {
    return this.repository.findByPhoneOrEmail(principal.sub, phone, email);
  }

  async getCustomerDetails(
    principal: JwtPrincipal,
    customerId: string,
  ): Promise<AgentCustomerDetailsResponse> {
    const customer = this.repository.findById(principal.sub, customerId);
    this.validator.ensureFound(customer);
    const bookingHistory = await this.findCustomerBookings(principal, customer);

    return {
      customer,
      bookingHistory,
      upcomingTrips: bookingHistory.filter(
        (booking) =>
          Date.parse(booking.trip.departureTime) >= Date.now() &&
          !["CANCELLED", "FAILED", "EXPIRED"].includes(booking.status),
      ),
    };
  }

  createCustomer(
    principal: JwtPrincipal,
    request: CreateAgentCustomerRequest,
  ): AgentCustomerRecord {
    const existing = this.repository.list(principal.sub, { pageSize: 100 }).customers;
    this.validator.ensureUnique(request, existing);
    const createdAt = new Date().toISOString();
    const customer = this.mapper.fromCreateRequest(request, {
      customerId: createCustomerId(request.email, createdAt),
      createdAt,
    });

    return this.repository.save(principal.sub, customer);
  }

  updateCustomer(
    principal: JwtPrincipal,
    customerId: string,
    request: UpdateAgentCustomerRequest,
  ): AgentCustomerRecord {
    const customer = this.repository.findById(principal.sub, customerId);
    this.validator.ensureFound(customer);
    const updated = this.mapper.mergeUpdate(customer, request, new Date().toISOString());

    return this.repository.save(principal.sub, updated);
  }

  deleteCustomer(
    principal: JwtPrincipal,
    customerId: string,
  ): { customerId: string; deleted: boolean } {
    const customer = this.repository.findById(principal.sub, customerId);
    this.validator.ensureFound(customer);

    return {
      customerId,
      deleted: this.repository.delete(principal.sub, customerId),
    };
  }

  ensureBookable(principal: JwtPrincipal, customerId: string): AgentCustomerRecord {
    const customer = this.repository.findById(principal.sub, customerId);
    this.validator.ensureBookable(customer);

    return customer;
  }

  recordBooking(
    principal: JwtPrincipal,
    customerId: string,
    booking: BookingRecord,
  ): AgentCustomerRecord | null {
    return this.repository.updateMetrics(principal.sub, customerId, {
      amount: booking.fare.grandTotal.amount,
      bookedAt: booking.confirmedAt ?? booking.createdAt,
    });
  }

  listRecent(principal: JwtPrincipal, limit = 5): AgentCustomerRecord[] {
    return this.repository.listRecent(principal.sub, limit);
  }

  private async findCustomerBookings(
    principal: JwtPrincipal,
    customer: AgentCustomerRecord,
  ): Promise<BookingRecord[]> {
    return (await this.bookingService.listBookings(principal)).filter((booking) =>
      booking.passengers.some(
        (passenger) => passenger.email === customer.email || passenger.phone === customer.phone,
      ),
    );
  }
}

function createCustomerId(email: string, value: string): string {
  const hash = [...`${email}|${value}`].reduce(
    (current, char) => (current * 31 + char.charCodeAt(0)) >>> 0,
    2166136261,
  );

  return `CUS-${hash.toString(36).toUpperCase().padStart(8, "0").slice(0, 8)}`;
}
