import { Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "ticket",
  boundedContext: "Ticket issuance",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Ticket records",
      description: "Track issued, cancelled, and refunded ticket states.",
    },
    {
      name: "PDF handoff",
      description: "Prepare generated ticket artifact references without provider coupling.",
    },
    {
      name: "Download audit",
      description: "Keep ticket download events ready for compliance logging.",
    },
  ],
} satisfies ModuleSummary;

/** When a booking's ticket was last downloaded or emailed. */
export interface TicketActivity {
  lastDownloadedAt: string | null;
  lastEmailedAt: string | null;
}

/**
 * The ticket itself is rebuilt from the saved booking every time, so it can
 * never drift from what was sold. Only its download/email activity is kept
 * here, in memory; the booking timeline holds the durable record of both.
 */
@Injectable()
export class TicketRepository {
  private readonly activity = new Map<string, TicketActivity>();

  findSummary(): ModuleSummary {
    return summary;
  }

  findActivity(bookingId: string): TicketActivity {
    return this.activity.get(bookingId) ?? { lastDownloadedAt: null, lastEmailedAt: null };
  }

  recordActivity(bookingId: string, change: Partial<TicketActivity>): TicketActivity {
    const updated = { ...this.findActivity(bookingId), ...change };
    this.activity.set(bookingId, updated);

    return updated;
  }
}
