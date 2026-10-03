import { Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "seat",
  boundedContext: "Seat inventory and layout",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Seat map normalization",
      description: "Represent the supplier's decks, rows, columns, and fare per seat.",
    },
    {
      name: "Availability checks",
      description: "Show each seat as the supplier reports it, without supplier-specific leakage.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class SeatRepository {
  findSummary(): ModuleSummary {
    return summary;
  }
}
