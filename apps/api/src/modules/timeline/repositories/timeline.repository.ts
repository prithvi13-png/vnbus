import { Injectable } from "@nestjs/common";
import type { BookingTimeline } from "@prisma/client";
import type { BookingTimelineEvent } from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";
import { PrismaService } from "../../../shared/prisma/prisma.service";

const summary = {
  module: "timeline",
  boundedContext: "Booking lifecycle timeline",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Lifecycle events",
      description: "Record booking, ticket, email, and cancellation milestones.",
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
  constructor(private readonly prisma: PrismaService) {}

  findSummary(): ModuleSummary {
    return summary;
  }

  async append(event: Omit<BookingTimelineEvent, "id">): Promise<BookingTimelineEvent> {
    const row = await this.prisma.bookingTimeline.create({
      data: {
        bookingId: event.bookingId,
        type: event.type,
        title: event.title,
        description: event.description,
        tone: event.tone,
        occurredAt: new Date(event.occurredAt),
      },
    });

    return toTimelineEvent(row);
  }

  async listForBookings(bookingIds: string[]): Promise<BookingTimelineEvent[]> {
    if (bookingIds.length === 0) {
      return [];
    }

    const rows = await this.prisma.bookingTimeline.findMany({
      where: { bookingId: { in: bookingIds } },
      orderBy: { occurredAt: "asc" },
    });

    return rows.map(toTimelineEvent);
  }
}

function toTimelineEvent(row: BookingTimeline): BookingTimelineEvent {
  return {
    id: row.id,
    bookingId: row.bookingId,
    type: row.type,
    title: row.title,
    description: row.description,
    occurredAt: row.occurredAt.toISOString(),
    tone: isTone(row.tone) ? row.tone : "info",
  };
}

function isTone(value: string): value is BookingTimelineEvent["tone"] {
  return ["neutral", "info", "success", "warning", "danger"].includes(value);
}
