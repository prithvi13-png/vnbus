import { BadRequestException, Injectable } from "@nestjs/common";
import type { BookingRecord } from "@vnbus/types";

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

  /** Only a booking the supplier sold, with the numbers it issued, has a ticket. */
  ensureTicketable(booking: BookingRecord): void {
    if (!["CONFIRMED", "TICKET_GENERATED"].includes(booking.status)) {
      throw new BadRequestException("A ticket is available only for a confirmed booking");
    }
    if (!booking.pnr && !booking.ticketNumber) {
      throw new BadRequestException(
        "The operator has not issued a ticket number for this booking yet",
      );
    }
  }
}
