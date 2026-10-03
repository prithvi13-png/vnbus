import { Injectable } from "@nestjs/common";
import { createTicketRecord } from "@vnbus/shared";
import type { BookingRecord, TicketRecord } from "@vnbus/types";

import { SUPPORT_EMAIL } from "../../booking/services/booking.service";
import type { TicketActivity } from "../repositories/ticket.repository";

@Injectable()
export class TicketMapper {
  fromBooking(booking: BookingRecord, activity: TicketActivity): TicketRecord {
    const ticket = createTicketRecord(booking, { supportEmail: SUPPORT_EMAIL });

    return {
      ...ticket,
      status: activity.lastEmailedAt
        ? "EMAIL_SENT"
        : activity.lastDownloadedAt
          ? "DOWNLOADED"
          : ticket.status,
      lastDownloadedAt: activity.lastDownloadedAt,
      lastEmailedAt: activity.lastEmailedAt,
    };
  }
}
