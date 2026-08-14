import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { BookingRecord } from "@vnbus/types";

@Injectable()
export class AgentBookingValidator {
  ensureBookingCreated(booking: BookingRecord | null): asserts booking is BookingRecord {
    if (!booking) {
      throw new BadRequestException("Booking failed");
    }
  }

  ensureBookingFound(booking: BookingRecord | null): asserts booking is BookingRecord {
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
  }

  ensureCanEmailTicket(booking: BookingRecord | null): asserts booking is BookingRecord {
    this.ensureBookingFound(booking);
    if (!["CONFIRMED", "TICKET_GENERATED", "RESCHEDULED"].includes(booking.status)) {
      throw new BadRequestException("Email failed: ticket is not generated");
    }
  }
}
