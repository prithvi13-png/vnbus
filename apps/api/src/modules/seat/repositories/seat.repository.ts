import { Injectable } from "@nestjs/common";
import type { SeatHoldResponse } from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "seat",
  boundedContext: "Seat inventory and layout",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Seat map normalization",
      description: "Represent decks, rows, columns, and fare per seat.",
    },
    {
      name: "Seat blocking",
      description: "Prepare lock expiry and release semantics.",
    },
    {
      name: "Seat hold timer",
      description: "Hold selected mock seats for ten minutes before automatic expiry.",
    },
    {
      name: "Availability checks",
      description: "Model seat availability without supplier-specific leakage.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class SeatRepository {
  private readonly holds = new Map<string, SeatHoldResponse>();

  findSummary(): ModuleSummary {
    return summary;
  }

  saveHold(hold: SeatHoldResponse): SeatHoldResponse {
    this.holds.set(hold.reservationId, hold);

    return hold;
  }

  findHold(reservationId: string): SeatHoldResponse | null {
    const hold = this.holds.get(reservationId);
    if (!hold) {
      return null;
    }
    if (Date.parse(hold.expiresAt) <= Date.now()) {
      this.holds.delete(reservationId);

      return {
        ...hold,
        status: "EXPIRED",
      };
    }

    return hold;
  }

  releaseHold(reservationId: string): void {
    this.holds.delete(reservationId);
  }
}
