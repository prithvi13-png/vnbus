import { Injectable } from "@nestjs/common";
import { createTicketRecord } from "@vnbus/shared";
import type { BookingRecord, TicketRecord } from "@vnbus/types";

@Injectable()
export class TicketMapper {
  fromBooking(booking: BookingRecord): TicketRecord {
    return createTicketRecord(booking);
  }
}
