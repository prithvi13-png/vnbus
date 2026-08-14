import { Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "booking-history",
  boundedContext: "Customer booking history",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Upcoming trips",
      description: "Expose future confirmed, ticketed, and rescheduled trips.",
    },
    {
      name: "Past trips",
      description: "Expose completed journey records.",
    },
    {
      name: "Cancelled trips",
      description: "Expose cancelled trips and refund placeholder state.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class BookingHistoryRepository {
  findSummary(): ModuleSummary {
    return summary;
  }
}
