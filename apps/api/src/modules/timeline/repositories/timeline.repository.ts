import { Injectable } from "@nestjs/common";
import type { BookingTimelineEvent } from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "timeline",
  boundedContext: "Booking lifecycle timeline",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Lifecycle events",
      description: "Record booking, ticket, email, cancellation, and reschedule milestones.",
    },
    {
      name: "Customer history feed",
      description: "Expose ordered events for booking detail and support views.",
    },
    {
      name: "Supplier-independent audit trail",
      description: "Keep timeline records based on internal models, not supplier payloads.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class TimelineRepository {
  private readonly events = new Map<string, BookingTimelineEvent[]>();

  findSummary(): ModuleSummary {
    return summary;
  }

  append(event: BookingTimelineEvent): BookingTimelineEvent {
    const current = this.events.get(event.bookingId) ?? [];
    const deduped = current.filter((item) => item.id !== event.id);

    this.events.set(event.bookingId, [...deduped, event]);

    return event;
  }

  listForBooking(bookingId: string): BookingTimelineEvent[] {
    return [...(this.events.get(bookingId) ?? [])].sort(
      (left, right) => Date.parse(left.occurredAt) - Date.parse(right.occurredAt),
    );
  }
}
