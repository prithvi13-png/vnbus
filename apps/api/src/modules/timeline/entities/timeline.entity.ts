export interface TimelineEventEntity {
  id: string;
  bookingId: string;
  type: string;
  title: string;
  description: string;
  occurredAt: Date;
}
