import { Injectable } from "@nestjs/common";
import type { AgentActivityLogRecord, AgentProfileRecord } from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "agent",
  boundedContext: "Travel agent operations",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Agency onboarding",
      description: "Model agent profile and compliance lifecycle.",
    },
    {
      name: "Agent-owned bookings",
      description: "Keep booking ownership ready for agency workflows.",
    },
    {
      name: "Managed customers",
      description: "Prepare agent customer relationship records.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class AgentRepository {
  private readonly activity = new Map<string, AgentActivityLogRecord>(
    seedActivity.map((item) => [item.id, item]),
  );

  findSummary(): ModuleSummary {
    return summary;
  }

  getProfile(): AgentProfileRecord {
    return agentProfile;
  }

  listActivity(limit = 8): AgentActivityLogRecord[] {
    return [...this.activity.values()]
      .sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt))
      .slice(0, limit);
  }

  appendActivity(input: Omit<AgentActivityLogRecord, "id" | "occurredAt">): AgentActivityLogRecord {
    const occurredAt = new Date().toISOString();
    const activity: AgentActivityLogRecord = {
      id: createActivityId(input.type, input.title, occurredAt),
      occurredAt,
      ...input,
    };

    this.activity.set(activity.id, activity);

    return activity;
  }
}

const agentProfile: AgentProfileRecord = {
  agentId: "AGT-VN-001",
  agencyName: "Vriddhi Nexus Partner Desk",
  agencyAddress: "Koramangala, Bengaluru, Karnataka",
  contactName: "Nisha Rao",
  email: "agent.ops@vriddhinexus.example",
  phone: "+918045678899",
  logoUrl: null,
  status: "ACTIVE",
  commissionRate: 4.5,
  emailPreferences: {
    bookingConfirmation: true,
    cancellation: true,
    reschedule: true,
    journeyReminder: true,
  },
  notificationPreferences: {
    inApp: true,
    email: true,
    system: true,
  },
};

const seedActivity: AgentActivityLogRecord[] = [
  {
    id: "AGT-ACT-001",
    type: "BOOKING_CREATED",
    title: "Quick booking completed",
    description: "Bangalore to Hyderabad ticket issued for Aarav Sharma.",
    occurredAt: "2026-08-08T08:50:00.000Z",
    actor: "Nisha Rao",
  },
  {
    id: "AGT-ACT-002",
    type: "CUSTOMER_UPDATED",
    title: "Customer note added",
    description: "Meera Iyer marked as family traveller.",
    occurredAt: "2026-08-08T08:10:00.000Z",
    actor: "Nisha Rao",
  },
  {
    id: "AGT-ACT-003",
    type: "SYSTEM",
    title: "Mock supplier adapter healthy",
    description: "Search and seat layout mocks responded normally.",
    occurredAt: "2026-08-08T07:45:00.000Z",
    actor: "System",
  },
];

function createActivityId(type: string, title: string, occurredAt: string): string {
  const hash = [...`${type}|${title}|${occurredAt}`].reduce(
    (current, char) => (current * 31 + char.charCodeAt(0)) >>> 0,
    2166136261,
  );

  return `AGT-ACT-${hash.toString(36).toUpperCase().padStart(8, "0").slice(0, 8)}`;
}
