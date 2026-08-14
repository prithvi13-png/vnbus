import { Injectable } from "@nestjs/common";
import type { AgentCustomerRecord, BookingRecord, TicketRecord } from "@vnbus/types";

import { AgentBookingEntity } from "../entities/agent-booking.entity";

@Injectable()
export class AgentBookingMapper {
  toEntity(
    booking: BookingRecord,
    customer: AgentCustomerRecord | null,
    ticket: TicketRecord | null,
  ): AgentBookingEntity {
    return new AgentBookingEntity({
      booking,
      customer,
      ticket,
      channel: "AGENT",
    });
  }
}
