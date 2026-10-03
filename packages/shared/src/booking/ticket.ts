import type {
  BookingFareSummary,
  BookingRecord,
  Money,
  SeatMapSeat,
  TicketPdfResponse,
  TicketRecord,
} from "@vnbus/types";

export const TICKET_TERMS = [
  "Carry a government issued photo ID while boarding.",
  "Reach the boarding point at least 20 minutes before departure.",
  "Cancellation charges follow the operator's policy shown at the time of booking.",
  "Live tracking is not yet available for this booking.",
];

export interface TicketOptions {
  /** Where travellers write to about this booking. */
  supportEmail: string;
  now?: Date;
}

/**
 * The fare for a set of seats, as the supplier priced them.
 *
 * A supplier's seat fare already includes GST, so nothing is added on top: the
 * tax shown is the part of the fare the supplier says is GST, and the base is
 * what remains. No discount or convenience fee is charged.
 */
export function summarizeSeatFare(seats: SeatMapSeat[]): BookingFareSummary {
  const total = seats.reduce((sum, seat) => sum + seat.fare.amount, 0);
  const tax = seats.reduce((sum, seat) => sum + seat.tax.amount, 0);

  return {
    baseFare: money(roundPaise(total - tax)),
    taxes: money(roundPaise(tax)),
    discount: money(0),
    convenienceFee: money(0),
    grandTotal: money(roundPaise(total)),
  };
}

/**
 * The ticket for a confirmed booking. Every identifier on it — PNR, ticket
 * number — is the one the supplier issued; a booking without them is not
 * ticketable and the caller must refuse before getting here.
 */
export function createTicketRecord(booking: BookingRecord, options: TicketOptions): TicketRecord {
  const now = options.now ?? new Date();
  const ticketNumber = booking.ticketNumber ?? "";
  const pnr = booking.pnr ?? "";

  return {
    ticketId: `TKT-${hashString(`${booking.bookingId}|${ticketNumber}`)
      .toString(36)
      .toUpperCase()
      .padStart(8, "0")
      .slice(0, 8)}`,
    bookingId: booking.bookingId,
    bookingReference: booking.bookingReference,
    ticketNumber,
    status: booking.status === "CANCELLED" ? "CANCELLED" : "GENERATED",
    pnr,
    journeyDate: booking.trip.departureTime.slice(0, 10),
    operatorName: booking.trip.operatorName,
    busType: booking.trip.busType,
    route: `${booking.trip.sourceCity} to ${booking.trip.destinationCity}`,
    departureTime: booking.trip.departureTime,
    arrivalTime: booking.trip.arrivalTime,
    durationMinutes: booking.trip.durationMinutes,
    passengers: booking.passengers,
    seatNumbers: booking.selectedSeats,
    boardingPoint: booking.boardingPoint,
    droppingPoint: booking.droppingPoint,
    fare: booking.fare,
    bookingDate: booking.createdAt,
    bookingStatus: booking.status,
    trackingStatus: "COMING_SOON",
    terms: TICKET_TERMS,
    emergencyContact: booking.passengers[0]?.emergencyContact ?? "Not provided",
    supportContact: { email: options.supportEmail },
    issuedAt: booking.confirmedAt ?? now.toISOString(),
    lastDownloadedAt: null,
    lastEmailedAt: null,
  };
}

/** A one-page PDF e-ticket built from the booking and the ticket above. */
export function createTicketPdf(booking: BookingRecord, options: TicketOptions): TicketPdfResponse {
  const ticket = createTicketRecord(booking, options);
  const passengerNames = booking.passengers
    .map((passenger) => `${passenger.firstName} ${passenger.lastName} (${passenger.seatNumber})`)
    .join(", ");
  const lines = [
    "Vriddhi Nexus Pvt Ltd",
    "Bus e-ticket",
    "",
    "BOOKING",
    `Ticket Number: ${ticket.ticketNumber}`,
    `PNR: ${ticket.pnr}`,
    `Booking Reference: ${booking.bookingReference}`,
    `Booking Status: ${ticket.bookingStatus}`,
    "",
    "PASSENGERS",
    `Passengers: ${passengerNames}`,
    `Seat Numbers: ${booking.selectedSeats.join(", ")}`,
    `Emergency Contact: ${ticket.emergencyContact}`,
    "",
    "JOURNEY",
    `Journey Date: ${ticket.journeyDate}`,
    `Route: ${ticket.route}`,
    `Departure: ${formatIst(booking.trip.departureTime)}`,
    `Arrival: ${formatIst(booking.trip.arrivalTime)}`,
    `Boarding: ${booking.boardingPoint.name}, ${formatIst(booking.boardingPoint.time)}`,
    `Dropping: ${booking.droppingPoint.name}, ${formatIst(booking.droppingPoint.time)}`,
    "",
    "BUS",
    `Operator: ${ticket.operatorName}`,
    `Bus Type: ${ticket.busType}`,
    "",
    "FARE (GST INCLUDED)",
    `Base Fare: INR ${booking.fare.baseFare.amount.toFixed(2)}`,
    `GST: INR ${booking.fare.taxes.amount.toFixed(2)}`,
    `Total: INR ${booking.fare.grandTotal.amount.toFixed(2)}`,
    "",
    "TERMS",
    ...TICKET_TERMS.map((term, index) => `${index + 1}. ${term}`),
    "",
    `Support: ${ticket.supportContact.email}`,
    `Issued by Vriddhi Nexus Pvt Ltd for ${ticket.operatorName}.`,
  ];

  return {
    ticketId: ticket.ticketId,
    fileName: `${booking.bookingReference}.pdf`,
    mimeType: "application/pdf",
    base64: createPdfBase64(lines),
    downloadStatus: "READY",
  };
}

/** India has one zone, UTC+05:30, with no daylight saving. */
const IST_OFFSET_MS = 330 * 60 * 1000;

/** "2026-11-02 05:00 IST" — the clock a traveller in India reads. */
function formatIst(iso: string): string {
  const time = Date.parse(iso);

  if (Number.isNaN(time)) {
    return iso;
  }

  return `${new Date(time + IST_OFFSET_MS).toISOString().slice(0, 16).replace("T", " ")} IST`;
}

function roundPaise(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function hashString(value: string): number {
  return [...value].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
}

function money(amount: number): Money {
  return { amount, currency: "INR" };
}

function createPdfBase64(lines: string[]): string {
  const content = lines
    .flatMap((line, index) => [`BT /F1 10 Tf 48 ${790 - index * 16} Td (${escapePdf(line)}) Tj ET`])
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return encodeBase64(pdf);
}

function escapePdf(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function encodeBase64(value: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "binary").toString("base64");
  }

  return btoa(value);
}
