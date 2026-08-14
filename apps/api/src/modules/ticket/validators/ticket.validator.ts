import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { BookingRecord, TicketRecord } from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

@Injectable()
export class TicketModuleValidator {
  ensureReady(summary: ModuleSummary): void {
    if (summary.status !== "READY_FOR_INTEGRATION") {
      throw new Error("Ticket module is not ready for integration");
    }

    if (summary.capabilities.length === 0) {
      throw new Error("Ticket module must expose at least one capability");
    }
  }

  ensureTicketable(booking: BookingRecord | null): asserts booking is BookingRecord {
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    if (
      !["CONFIRMED", "TICKET_GENERATED", "RESCHEDULED"].includes(booking.status) ||
      booking.status === "CANCELLED"
    ) {
      throw new BadRequestException("Ticket is available only after booking confirmation");
    }
  }

  ensureTicket(ticket: TicketRecord | null): asserts ticket is TicketRecord {
    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }
    if (ticket.status === "CANCELLED" || ticket.status === "REFUNDED") {
      throw new BadRequestException("Ticket is no longer active");
    }
  }
}
