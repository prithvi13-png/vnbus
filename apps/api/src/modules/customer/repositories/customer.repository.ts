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

@Injectable()
export class CustomerRepository {
  private readonly customers = new Map<string, AgentCustomerRecord>(
    seedCustomers.map((customer) => [customer.customerId, customer]),
  );

  findSummary(): ModuleSummary {
    return summary;
  }

  list(query: AgentCustomerListQuery = {}): AgentCustomerListResponse {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const normalized = query.search?.trim().toLowerCase();
    const tag = query.tag?.trim().toLowerCase();
    const filtered = [...this.customers.values()].filter((customer) => {
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

  findById(customerId: string): AgentCustomerRecord | null {
    return this.customers.get(customerId) ?? null;
  }

  findByPhoneOrEmail(phone: string, email: string): AgentCustomerRecord | null {
    return (
      [...this.customers.values()].find(
        (customer) =>
          customer.phone === phone || customer.email.toLowerCase() === email.toLowerCase(),
      ) ?? null
    );
  }

  save(customer: AgentCustomerRecord): AgentCustomerRecord {
    this.customers.set(customer.customerId, customer);

    return customer;
  }

  delete(customerId: string): boolean {
    return this.customers.delete(customerId);
  }

  updateMetrics(
    customerId: string,
    update: { amount: number; bookedAt: string; upcomingTripsDelta?: number },
  ): AgentCustomerRecord | null {
    const customer = this.findById(customerId);
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

    return this.save(updated);
  }

  listRecent(limit = 5): AgentCustomerRecord[] {
    return [...this.customers.values()]
      .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
      .slice(0, limit);
  }
}

const now = new Date("2026-08-08T09:00:00.000Z").toISOString();

const seedCustomers: AgentCustomerRecord[] = [
  {
    customerId: "CUS-AGT-001",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+919876543210",
    gender: "MALE",
    dateOfBirth: "1992-04-12",
    emergencyContact: "+919800000001",
    preferredRoutes: ["Bangalore to Hyderabad", "Hyderabad to Bangalore"],
    notes: [
      {
        noteId: "CUS-AGT-001-NOTE-001",
        customerId: "CUS-AGT-001",
        body: "Prefers lower sleeper seats and evening departures.",
        createdBy: "agent",
        createdAt: now,
      },
    ],
    tags: [
      { tagId: "CUS-AGT-001-TAG-001", customerId: "CUS-AGT-001", label: "VIP", color: "blue" },
      {
        tagId: "CUS-AGT-001-TAG-002",
        customerId: "CUS-AGT-001",
        label: "Corporate",
        color: "emerald",
      },
    ],
    status: "VIP",
    bookingCount: 4,
    upcomingTrips: 1,
    lifetimeValue: { amount: 6400, currency: "INR" },
    lastBookedAt: now,
    createdAt: "2026-07-18T10:30:00.000Z",
    updatedAt: now,
  },
  {
    customerId: "CUS-AGT-002",
    name: "Meera Iyer",
    email: "meera.iyer@example.com",
    phone: "+919876543211",
    gender: "FEMALE",
    dateOfBirth: "1988-11-02",
    emergencyContact: "+919800000002",
    preferredRoutes: ["Chennai to Coimbatore"],
    notes: [
      {
        noteId: "CUS-AGT-002-NOTE-001",
        customerId: "CUS-AGT-002",
        body: "Books family trips frequently.",
        createdBy: "agent",
        createdAt: now,
      },
    ],
    tags: [
      {
        tagId: "CUS-AGT-002-TAG-001",
        customerId: "CUS-AGT-002",
        label: "Family",
        color: "violet",
      },
    ],
    status: "ACTIVE",
    bookingCount: 2,
    upcomingTrips: 1,
    lifetimeValue: { amount: 3200, currency: "INR" },
    lastBookedAt: "2026-08-06T11:20:00.000Z",
    createdAt: "2026-07-25T06:30:00.000Z",
    updatedAt: "2026-08-06T11:20:00.000Z",
  },
  {
    customerId: "CUS-AGT-003",
    name: "Rohan Gupta",
    email: "rohan.gupta@example.com",
    phone: "+919876543212",
    gender: "MALE",
    dateOfBirth: "1995-02-20",
    emergencyContact: "+919800000003",
    preferredRoutes: ["Pune to Goa"],
    notes: [],
    tags: [
      {
        tagId: "CUS-AGT-003-TAG-001",
        customerId: "CUS-AGT-003",
        label: "Student",
        color: "gray",
      },
    ],
    status: "ACTIVE",
    bookingCount: 1,
    upcomingTrips: 0,
    lifetimeValue: { amount: 1450, currency: "INR" },
    lastBookedAt: "2026-08-01T09:15:00.000Z",
    createdAt: "2026-08-01T09:15:00.000Z",
    updatedAt: "2026-08-01T09:15:00.000Z",
  },
];
