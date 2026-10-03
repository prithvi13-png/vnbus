import { Injectable } from "@nestjs/common";
import type {
  AgentCustomerListQuery,
  AgentCustomerListResponse,
  AgentCustomerRecord,
} from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "customer",
  boundedContext: "Customer identity and traveller profile management",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Profile lifecycle",
      description: "Manage customer profile and contact records.",
    },
    {
      name: "Traveller preferences",
      description: "Keep traveller-level preferences ready for booking workflows.",
    },
    {
      name: "Saved passengers",
      description: "Prepare reusable passenger records for faster checkout.",
    },
  ],
} satisfies ModuleSummary;

/**
 * Customers a travel agent manages, kept per agent: one agent never sees
 * another's customers. Held in memory, so the list starts empty after a
 * restart; bookings themselves are stored in the database.
 */
@Injectable()
export class CustomerRepository {
  private readonly customersByAgent = new Map<string, Map<string, AgentCustomerRecord>>();

  findSummary(): ModuleSummary {
    return summary;
  }

  list(agentUserId: string, query: AgentCustomerListQuery = {}): AgentCustomerListResponse {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const normalized = query.search?.trim().toLowerCase();
    const tag = query.tag?.trim().toLowerCase();
    const filtered = [...this.customers(agentUserId).values()].filter((customer) => {
      const matchesSearch =
        !normalized ||
        [customer.name, customer.email, customer.phone, ...customer.preferredRoutes]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesTag = !tag || customer.tags.some((item) => item.label.toLowerCase() === tag);
      const matchesStatus = !query.status || customer.status === query.status;

      return matchesSearch && matchesTag && matchesStatus;
    });

    return {
      customers: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
  }

  findById(agentUserId: string, customerId: string): AgentCustomerRecord | null {
    return this.customers(agentUserId).get(customerId) ?? null;
  }

  findByPhoneOrEmail(
    agentUserId: string,
    phone: string,
    email: string,
  ): AgentCustomerRecord | null {
    return (
      [...this.customers(agentUserId).values()].find(
        (customer) =>
          customer.phone === phone || customer.email.toLowerCase() === email.toLowerCase(),
      ) ?? null
    );
  }

  save(agentUserId: string, customer: AgentCustomerRecord): AgentCustomerRecord {
    this.customers(agentUserId).set(customer.customerId, customer);

    return customer;
  }

  delete(agentUserId: string, customerId: string): boolean {
    return this.customers(agentUserId).delete(customerId);
  }

  updateMetrics(
    agentUserId: string,
    customerId: string,
    update: { amount: number; bookedAt: string; upcomingTripsDelta?: number },
  ): AgentCustomerRecord | null {
    const customer = this.findById(agentUserId, customerId);
    if (!customer) {
      return null;
    }

    const updated: AgentCustomerRecord = {
      ...customer,
      bookingCount: customer.bookingCount + 1,
      upcomingTrips: Math.max(0, customer.upcomingTrips + (update.upcomingTripsDelta ?? 1)),
      lifetimeValue: {
        amount: customer.lifetimeValue.amount + update.amount,
        currency: "INR",
      },
      lastBookedAt: update.bookedAt,
      updatedAt: update.bookedAt,
    };

    return this.save(agentUserId, updated);
  }

  listRecent(agentUserId: string, limit = 5): AgentCustomerRecord[] {
    return [...this.customers(agentUserId).values()]
      .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
      .slice(0, limit);
  }

  private customers(agentUserId: string): Map<string, AgentCustomerRecord> {
    let customers = this.customersByAgent.get(agentUserId);

    if (!customers) {
      customers = new Map();
      this.customersByAgent.set(agentUserId, customers);
    }

    return customers;
  }
}
