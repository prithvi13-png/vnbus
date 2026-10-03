import { Injectable } from "@nestjs/common";

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
}
