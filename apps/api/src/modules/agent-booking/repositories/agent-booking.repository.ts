import { Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "agent-booking",
  boundedContext: "B2B travel agent booking operations",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Quick booking",
      description: "Create agent-owned bookings through the shared booking engine.",
    },
    {
      name: "Ticket actions",
      description: "Download and email generated tickets from the agent workspace.",
    },
    {
      name: "Operational filters",
      description: "Search, sort, filter, and paginate bookings for high-volume agents.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class AgentBookingRepository {
  findSummary(): ModuleSummary {
    return summary;
  }
}
