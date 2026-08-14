export interface BookingHistoryEntity {
  id: string;
  bookingId: string;
  status: string;
  journeyDate: Date;
  createdAt: Date;
}
