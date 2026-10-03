import { Injectable } from "@nestjs/common";
import type { AgentActivityLogRecord, AgentProfileRecord } from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";
import { PrismaService } from "../../../shared/prisma/prisma.service";

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
  /** Recent workspace activity per agent. In memory, so it starts empty after a restart. */
  private readonly activity = new Map<string, AgentActivityLogRecord[]>();

  constructor(private readonly prisma: PrismaService) {}

  findSummary(): ModuleSummary {
    return summary;
  }

  /**
   * The signed-in agent's profile: their agency record when one has been set
   * up, otherwise their own account. An account granted the travel-agent role
   * by an admin counts as approved.
   */
  async getProfile(userId: string): Promise<AgentProfileRecord> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { agent: true },
    });
    const agent = user.agent;
    const contactName = `${user.firstName} ${user.lastName}`.trim();

    return {
      agentId: agent?.id ?? user.id,
      agencyName: agent?.agencyName ?? contactName,
      agencyAddress: agent?.agencyAddress ?? "",
      contactName: agent?.contactName ?? contactName,
      email: user.email,
      phone: agent?.phone ?? user.phone,
      logoUrl: agent?.logoUrl ?? null,
      status: toAgentStatus(agent?.status ?? (user.status === "ACTIVE" ? "ACTIVE" : "SUSPENDED")),
      commissionRate: agent ? Number(agent.commissionRate) : 0,
      emailPreferences: {
        bookingConfirmation: true,
        cancellation: true,
        reschedule: true,
        journeyReminder: true,
        ...(agent?.emailPreferences as Partial<AgentProfileRecord["emailPreferences"]> | null),
      },
      notificationPreferences: {
        inApp: true,
        email: true,
        system: true,
        ...(agent?.notificationPreferences as Partial<
          AgentProfileRecord["notificationPreferences"]
        > | null),
      },
    };
  }

  listActivity(userId: string, limit = 8): AgentActivityLogRecord[] {
    return (this.activity.get(userId) ?? []).slice(0, limit);
  }

  appendActivity(
    userId: string,
    input: Omit<AgentActivityLogRecord, "id" | "occurredAt">,
  ): AgentActivityLogRecord {
    const occurredAt = new Date().toISOString();
    const activity: AgentActivityLogRecord = {
      id: createActivityId(input.type, input.title, occurredAt),
      occurredAt,
      ...input,
    };

    this.activity.set(userId, [activity, ...(this.activity.get(userId) ?? [])].slice(0, 100));

    return activity;
  }
}

function toAgentStatus(value: string): AgentProfileRecord["status"] {
  return value === "ACTIVE" || value === "SUSPENDED" ? value : "PENDING_REVIEW";
}

function createActivityId(type: string, title: string, occurredAt: string): string {
  const hash = [...`${type}|${title}|${occurredAt}`].reduce(
    (current, char) => (current * 31 + char.charCodeAt(0)) >>> 0,
    2166136261,
  );

  return `AGT-ACT-${hash.toString(36).toUpperCase().padStart(8, "0").slice(0, 8)}`;
}
