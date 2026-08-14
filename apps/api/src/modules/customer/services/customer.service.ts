import { Injectable, Optional } from "@nestjs/common";
import type {
  AgentCustomerDetailsResponse,
  AgentCustomerListQuery,
  AgentCustomerListResponse,
  AgentCustomerRecord,
  BookingRecord,
  CreateAgentCustomerRequest,
  UpdateAgentCustomerRequest,
} from "@vnbus/types";

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
    @Optional() private readonly bookingService?: BookingService,
  ) {}

  getSummary(): CustomerSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new CustomerSummaryDto(summary);
  }

  listCustomers(query: AgentCustomerListQuery = {}): AgentCustomerListResponse {
    return this.repository.list(query);
  }

  getCustomer(customerId: string): AgentCustomerRecord | null {
    return this.repository.findById(customerId);
  }

  findByPhoneOrEmail(phone: string, email: string): AgentCustomerRecord | null {
    return this.repository.findByPhoneOrEmail(phone, email);
  }

  getCustomerDetails(customerId: string): AgentCustomerDetailsResponse {
    const customer = this.repository.findById(customerId);
    this.validator.ensureFound(customer);
    const bookingHistory = this.findCustomerBookings(customer);

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

  createCustomer(request: CreateAgentCustomerRequest): AgentCustomerRecord {
    const existing = this.repository.list({ pageSize: 100 }).customers;
    this.validator.ensureUnique(request, existing);
    const createdAt = new Date().toISOString();
    const customer = this.mapper.fromCreateRequest(request, {
      customerId: createCustomerId(request.email, createdAt),
      createdAt,
    });

    return this.repository.save(customer);
  }

  updateCustomer(customerId: string, request: UpdateAgentCustomerRequest): AgentCustomerRecord {
    const customer = this.repository.findById(customerId);
    this.validator.ensureFound(customer);
    const updated = this.mapper.mergeUpdate(customer, request, new Date().toISOString());

    return this.repository.save(updated);
  }

  deleteCustomer(customerId: string): { customerId: string; deleted: boolean } {
    const customer = this.repository.findById(customerId);
    this.validator.ensureFound(customer);

    return {
      customerId,
      deleted: this.repository.delete(customerId),
    };
  }

  ensureBookable(customerId: string): AgentCustomerRecord {
    const customer = this.repository.findById(customerId);
    this.validator.ensureBookable(customer);

    return customer;
  }

  recordBooking(customerId: string, booking: BookingRecord): AgentCustomerRecord | null {
    return this.repository.updateMetrics(customerId, {
      amount: booking.fare.grandTotal.amount,
      bookedAt: booking.confirmedAt ?? booking.createdAt,
    });
  }

  listRecent(limit = 5): AgentCustomerRecord[] {
    return this.repository.listRecent(limit);
  }

  private findCustomerBookings(customer: AgentCustomerRecord): BookingRecord[] {
    return (this.bookingService?.listBookings() ?? []).filter((booking) =>
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
