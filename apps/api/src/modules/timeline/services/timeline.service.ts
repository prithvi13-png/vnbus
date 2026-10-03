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

  append(input: CreateTimelineEventInput): Promise<BookingTimelineEvent> {
    this.validator.ensureEvent(input);

    return this.repository.append({
      bookingId: input.bookingId,
      type: input.type,
      title: input.title,
      description: input.description,
      occurredAt: input.occurredAt ?? new Date().toISOString(),
      tone: input.tone ?? "info",
    });
  }

  listForBookings(bookingIds: string[]): Promise<BookingTimelineEvent[]> {
    return this.repository.listForBookings(bookingIds);
  }
}
