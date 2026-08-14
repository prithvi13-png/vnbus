import type { BookingTimelineEvent, BookingTimelineEventType } from "@vnbus/types";

export interface CreateTimelineEventInput {
  bookingId: string;
  type: BookingTimelineEventType;
  title: string;
  description: string;
  occurredAt?: string;
  tone?: BookingTimelineEvent["tone"];
}

export interface TimelineModulePort {
  append(input: CreateTimelineEventInput): BookingTimelineEvent;
  listForBooking(bookingId: string): BookingTimelineEvent[];
}
