import { Injectable } from "@nestjs/common";
import type { NotificationRecord } from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "agent-notification",
  boundedContext: "B2B agent notifications",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Agent notification feed",
      description: "Surface booking, cancellation, reminder, and system updates.",
    },
    {
      name: "Read state",
      description: "Support read and unread notification center states.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class AgentNotificationRepository {
  findSummary(): ModuleSummary {
    return summary;
  }

  listSeed(): NotificationRecord[] {
    return seedNotifications;
  }
}

const seedNotifications: NotificationRecord[] = [
  {
    id: "AGT-NTF-001",
    type: "AGENT_JOURNEY_REMINDER",
    readStatus: "UNREAD",
    title: "Journey reminder",
    body: "Bangalore to Hyderabad passengers board at 06:00 tomorrow.",
    createdAt: "2026-08-08T08:30:00.000Z",
    readAt: null,
  },
  {
    id: "AGT-NTF-002",
    type: "AGENT_SYSTEM",
    readStatus: "READ",
    title: "Mock supplier healthy",
    body: "Search, seats, booking, ticket, and email mock adapters are available.",
    createdAt: "2026-08-08T07:45:00.000Z",
    readAt: "2026-08-08T08:00:00.000Z",
  },
];
