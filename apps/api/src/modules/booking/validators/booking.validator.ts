import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { BookingRecord, SeatHoldResponse } from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";
import type {
  ConfirmBookingDto,
  CreateBookingDto,
  RescheduleBookingDto,
} from "../dto/booking-workflow.dto";

@Injectable()
export class BookingModuleValidator {
  ensureReady(summary: ModuleSummary): void {
    if (summary.status !== "READY_FOR_INTEGRATION") {
      throw new Error("Booking module is not ready for integration");
    }

    if (summary.capabilities.length === 0) {
      throw new Error("Booking module must expose at least one capability");
    }
  }

  ensureCreateRequest(
    dto: CreateBookingDto,
    hold: SeatHoldResponse | null,
  ): asserts hold is SeatHoldResponse {
    if (!hold) {
      throw new NotFoundException("Seat reservation not found");
    }
    if (hold.status === "EXPIRED" || Date.parse(hold.expiresAt) <= Date.now()) {
      throw new BadRequestException("Seat reservation expired");
    }
    if (dto.selectedSeats.length !== dto.passengers.length) {
      throw new BadRequestException("Passenger count must match selected seats");
    }
    if (dto.supplierCode !== "MOCK") {
      throw new BadRequestException("Only MOCK supplier is enabled in Milestone 6");
    }
  }

  ensureConfirmRequest(
    dto: ConfirmBookingDto,
    booking: BookingRecord | null,
  ): asserts booking is BookingRecord {
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    if (booking.status === "EXPIRED") {
      throw new BadRequestException("Booking session expired");
    }
    if (booking.status === "CONFIRMED" || booking.status === "TICKET_GENERATED") {
      throw new BadRequestException("Booking is already confirmed");
    }
    if (!dto.paymentReference.trim()) {
      throw new BadRequestException("paymentReference is required");
    }
  }

  ensureCancellable(booking: BookingRecord | null): asserts booking is BookingRecord {
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    if (booking.status === "CANCELLED" || booking.status === "REFUND_PENDING") {
      throw new BadRequestException("Booking is already cancelled");
    }
    if (booking.status === "EXPIRED" || booking.status === "FAILED") {
      throw new BadRequestException("Only active bookings can be cancelled");
    }
    if (Date.parse(booking.trip.departureTime) <= Date.now()) {
      throw new BadRequestException("Journey completed bookings cannot be cancelled");
    }
  }

  ensureReschedulable(
    dto: RescheduleBookingDto,
    booking: BookingRecord | null,
  ): asserts booking is BookingRecord {
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    if (booking.status === "CANCELLED" || booking.status === "REFUND_PENDING") {
      throw new BadRequestException("Cancelled bookings cannot be rescheduled");
    }
    if (Date.parse(booking.trip.departureTime) <= Date.now()) {
      throw new BadRequestException("Journey completed bookings cannot be rescheduled");
    }
    if (Date.parse(dto.newJourneyDate) <= Date.now()) {
      throw new BadRequestException("Select a future journey date");
    }
  }
}
