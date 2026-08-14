import { Injectable } from "@nestjs/common";
import type { TicketPdfResponse, TicketRecord } from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "ticket",
  boundedContext: "Ticket issuance",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Ticket records",
      description: "Track issued, cancelled, and refunded ticket states.",
    },
    {
      name: "PDF handoff",
      description: "Prepare generated ticket artifact references without provider coupling.",
    },
    {
      name: "Download audit",
      description: "Keep ticket download events ready for compliance logging.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class TicketRepository {
  private readonly tickets = new Map<string, TicketRecord>();
  private readonly ticketIdsByBooking = new Map<string, string>();
  private readonly downloads = new Map<string, TicketPdfResponse[]>();

  findSummary(): ModuleSummary {
    return summary;
  }

  save(ticket: TicketRecord): TicketRecord {
    this.tickets.set(ticket.ticketId, ticket);
    this.ticketIdsByBooking.set(ticket.bookingId, ticket.ticketId);

    return ticket;
  }

  findByTicketId(ticketId: string): TicketRecord | null {
    return this.tickets.get(ticketId) ?? null;
  }

  findByBookingId(bookingId: string): TicketRecord | null {
    const ticketId = this.ticketIdsByBooking.get(bookingId);

    return ticketId ? this.findByTicketId(ticketId) : null;
  }

  findById(id: string): TicketRecord | null {
    return this.findByTicketId(id) ?? this.findByBookingId(id);
  }

  recordDownload(ticketId: string, response: TicketPdfResponse): TicketPdfResponse {
    const current = this.downloads.get(ticketId) ?? [];
    this.downloads.set(ticketId, [...current, response]);

    return response;
  }

  listDownloads(ticketId: string): TicketPdfResponse[] {
    return this.downloads.get(ticketId) ?? [];
  }
}
