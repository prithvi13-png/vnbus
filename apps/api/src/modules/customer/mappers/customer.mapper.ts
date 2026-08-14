import { Injectable } from "@nestjs/common";
import type {
  AgentCustomerRecord,
  CreateAgentCustomerRequest,
  UpdateAgentCustomerRequest,
} from "@vnbus/types";

import { AgentCustomerEntity } from "../entities/customer.entity";

@Injectable()
export class CustomerMapper {
  toEntity(customer: AgentCustomerRecord): AgentCustomerEntity {
    return new AgentCustomerEntity(customer);
  }

  fromCreateRequest(
    request: CreateAgentCustomerRequest,
    options: { customerId: string; createdAt: string },
  ): AgentCustomerRecord {
    return this.toEntity({
      customerId: options.customerId,
      name: request.name.trim(),
      email: request.email.trim().toLowerCase(),
      phone: request.phone.trim(),
      gender: request.gender,
      dateOfBirth: request.dateOfBirth ?? null,
      emergencyContact: request.emergencyContact ?? null,
      preferredRoutes: request.preferredRoutes ?? [],
      notes: request.notes
        ? [
            {
              noteId: `${options.customerId}-NOTE-001`,
              customerId: options.customerId,
              body: request.notes.trim(),
              createdBy: "agent",
              createdAt: options.createdAt,
            },
          ]
        : [],
      tags: (request.tags ?? []).map((label, index) => ({
        tagId: `${options.customerId}-TAG-${index + 1}`,
        customerId: options.customerId,
        label,
        color: tagColor(label),
      })),
      status: request.tags?.includes("VIP") ? "VIP" : "ACTIVE",
      bookingCount: 0,
      upcomingTrips: 0,
      lifetimeValue: { amount: 0, currency: "INR" },
      lastBookedAt: null,
      createdAt: options.createdAt,
      updatedAt: options.createdAt,
    });
  }

  mergeUpdate(
    existing: AgentCustomerRecord,
    request: UpdateAgentCustomerRequest,
    updatedAt: string,
  ): AgentCustomerRecord {
    return this.toEntity({
      ...existing,
      name: request.name?.trim() ?? existing.name,
      email: request.email?.trim().toLowerCase() ?? existing.email,
      phone: request.phone?.trim() ?? existing.phone,
      gender: request.gender ?? existing.gender,
      dateOfBirth: request.dateOfBirth === undefined ? existing.dateOfBirth : request.dateOfBirth,
      emergencyContact:
        request.emergencyContact === undefined
          ? existing.emergencyContact
          : request.emergencyContact,
      preferredRoutes: request.preferredRoutes ?? existing.preferredRoutes,
      notes:
        request.notes === undefined
          ? existing.notes
          : [
              ...existing.notes,
              {
                noteId: `${existing.customerId}-NOTE-${existing.notes.length + 1}`,
                customerId: existing.customerId,
                body: request.notes.trim(),
                createdBy: "agent",
                createdAt: updatedAt,
              },
            ],
      tags:
        request.tags === undefined
          ? existing.tags
          : request.tags.map((label, index) => ({
              tagId: `${existing.customerId}-TAG-${index + 1}`,
              customerId: existing.customerId,
              label,
              color: tagColor(label),
            })),
      status: request.status ?? existing.status,
      updatedAt,
    });
  }
}

function tagColor(label: string): string {
  const normalized = label.toLowerCase();
  if (normalized.includes("vip")) {
    return "gold";
  }
  if (normalized.includes("corporate")) {
    return "brand";
  }
  if (normalized.includes("family")) {
    return "violet";
  }

  return "gray";
}
