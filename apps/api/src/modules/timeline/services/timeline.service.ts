import { Injectable } from "@nestjs/common";
import type { BookingTimelineEvent } from "@vnbus/types";

import { TimelineSummaryDto } from "../dto/timeline-summary.dto";
import type {
  CreateTimelineEventInput,
  TimelineModulePort,
} from "../interfaces/timeline.interface";
import { TimelineRepository } from "../repositories/timeline.repository";
import { TimelineModuleValidator } from "../validators/timeline.validator";

@Injectable()
export class TimelineService implements TimelineModulePort {
  constructor(
    private readonly repository: TimelineRepository,
    private readonly validator: TimelineModuleValidator,
  ) {}

  getSummary(): TimelineSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new TimelineSummaryDto(summary);
  }

  append(input: CreateTimelineEventInput): BookingTimelineEvent {
    this.validator.ensureEvent(input);
    const occurredAt = input.occurredAt ?? new Date().toISOString();
    const event: BookingTimelineEvent = {
      id: createTimelineId(input.bookingId, input.type, occurredAt),
      bookingId: input.bookingId,
      type: input.type,
      title: input.title,
      description: input.description,
      occurredAt,
      tone: input.tone ?? "info",
    };

    return this.repository.append(event);
  }

  listForBooking(bookingId: string): BookingTimelineEvent[] {
    return this.repository.listForBooking(bookingId);
  }
}

function createTimelineId(bookingId: string, type: string, occurredAt: string): string {
  const hash = [...`${bookingId}|${type}|${occurredAt}`].reduce(
    (value, char) => (value * 31 + char.charCodeAt(0)) >>> 0,
    2166136261,
  );

  return `TL-${hash.toString(36).toUpperCase().padStart(8, "0").slice(0, 8)}`;
}
