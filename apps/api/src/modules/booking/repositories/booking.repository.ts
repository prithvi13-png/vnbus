import { Injectable } from "@nestjs/common";
import type { BookingRecord } from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "booking",
  boundedContext: "Booking lifecycle",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Booking draft",
      description: "Represent booking creation before payment confirmation.",
    },
    {
      name: "Seat-held booking review",
      description: "Create a pending-payment booking from an active seat reservation.",
    },
    {
      name: "Confirmation records",
      description: "Keep supplier PNR and internal booking references separate.",
    },
    {
      name: "Cancellation readiness",
      description: "Prepare cancellation and reschedule policy boundaries.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class BookingRepository {
  private readonly bookings = new Map<string, BookingRecord>();

  findSummary(): ModuleSummary {
    return summary;
  }

  saveBooking(booking: BookingRecord): BookingRecord {
    this.bookings.set(booking.bookingId, booking);

    return booking;
  }

  findBooking(bookingId: string): BookingRecord | null {
    return this.bookings.get(bookingId) ?? null;
  }

  listBookings(): BookingRecord[] {
    return [...this.bookings.values()].sort(
      (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
    );
  }
}
