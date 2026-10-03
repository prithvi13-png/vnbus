import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import type { BookingRecord, SeatLayoutDetails, SeatMapSeat } from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";
import type { CreateBookingDto } from "../dto/booking-workflow.dto";

/** A booking the supplier has sold and not yet cancelled. */
const ACTIVE_STATUSES = new Set(["CONFIRMED", "TICKET_GENERATED"]);

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

  ensureCreateRequest(dto: CreateBookingDto): void {
    if (new Set(dto.selectedSeats).size !== dto.selectedSeats.length) {
      throw new BadRequestException("Duplicate seat numbers are not allowed");
    }
    if (dto.selectedSeats.length !== dto.passengers.length) {
      throw new BadRequestException("Passenger count must match selected seats");
    }

    const passengerSeats = dto.passengers.map((passenger) => passenger.seatNumber).sort();
    const selectedSeats = [...dto.selectedSeats].sort();

    if (passengerSeats.join("|") !== selectedSeats.join("|")) {
      throw new BadRequestException("Each passenger must be assigned one of the selected seats");
    }
  }

  /**
   * Checks the selection against the supplier's live seat map, so a seat that
   * sold since the traveller opened the page is refused here instead of
   * failing half-way through the supplier's block.
   */
  ensureSeatsBookable(dto: CreateBookingDto, layout: SeatLayoutDetails): SeatMapSeat[] {
    const seats = layout.decks.flatMap((deck) => deck.seats);
    const selected = dto.selectedSeats.map((seatNumber) =>
      seats.find((seat) => seat.seatNumber === seatNumber),
    );

    if (selected.some((seat) => !seat)) {
      throw new BadRequestException("One or more seats are not part of this bus");
    }

    const chosen = selected as SeatMapSeat[];
    const taken = chosen.filter((seat) => seat.status !== "AVAILABLE" && seat.status !== "LADIES");

    if (taken.length > 0) {
      throw new ConflictException(
        `Seat ${taken.map((seat) => seat.seatNumber).join(", ")} is no longer available`,
      );
    }
    if (layout.maxSelectableSeats > 0 && chosen.length > layout.maxSelectableSeats) {
      throw new BadRequestException(
        `This operator allows at most ${layout.maxSelectableSeats} seats per booking`,
      );
    }

    const ladiesSeatForMan = dto.passengers.find(
      (passenger) =>
        passenger.gender !== "FEMALE" &&
        chosen.find((seat) => seat.seatNumber === passenger.seatNumber)?.genderRestriction ===
          "LADIES",
    );

    if (ladiesSeatForMan) {
      throw new BadRequestException(
        `Seat ${ladiesSeatForMan.seatNumber} is reserved for women passengers`,
      );
    }

    return chosen;
  }

  ensureCancellable(booking: BookingRecord): void {
    if (booking.status === "CANCELLATION_REQUESTED") {
      throw new BadRequestException("Cancellation has already been requested for this booking");
    }
    if (booking.status === "CANCELLED" || booking.status === "REFUND_PENDING") {
      throw new BadRequestException("Booking is already cancelled");
    }
    if (!ACTIVE_STATUSES.has(booking.status)) {
      throw new BadRequestException("Only confirmed bookings can be cancelled");
    }
    if (Date.parse(booking.trip.departureTime) <= Date.now()) {
      throw new BadRequestException("Journey completed bookings cannot be cancelled");
    }
  }
}
