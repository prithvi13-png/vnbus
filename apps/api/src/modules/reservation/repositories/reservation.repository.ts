import { Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "reservation",
  boundedContext: "Seat reservation lifecycle",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Reservation logs",
      description: "Track hold, release, expiry, booking creation, and confirmation events.",
    },
    {
      name: "Timeout policy",
      description: "Represent ten-minute seat holds and future supplier release semantics.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class ReservationRepository {
  findSummary(): ModuleSummary {
    return summary;
  }
}
