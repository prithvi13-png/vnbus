import type {
  BoardingDroppingPoint,
  BookingConfirmationResponse,
  BookingFareSummary,
  BookingRecord,
  BusPoint,
  ConfirmBookingRequest,
  CreateBookingRequest,
  Money,
  SeatDeck,
  SeatDeckLayout,
  SeatHoldRequest,
  SeatHoldResponse,
  SeatKind,
  SeatLayoutDetails,
  SeatMapSeat,
  SeatReleaseRequest,
  SeatReleaseResponse,
  SeatStatus,
  TicketPdfResponse,
  TicketQrCode,
  TicketRecord,
  VehicleLayoutType,
} from "@vnbus/types";

import { getMockTripById } from "../search/mock-search-data.js";

const HOLD_DURATION_SECONDS = 10 * 60;
const INDIA_TAX_RATE = 0.05;
const CONVENIENCE_FEE_PER_SEAT = 35;
const TERMS = [
  "Carry a government issued photo ID while boarding.",
  "Reach the boarding point at least 20 minutes before departure.",
  "Seat holds expire automatically if the booking is not confirmed in time.",
  "Live tracking is marked Coming Soon for mock bookings.",
];

interface SeatLayoutRequest {
  tripId: string;
  journeyDate: string;
  heldSeats?: string[];
}

export function getMockSeatLayout({
  heldSeats = [],
  journeyDate,
  tripId,
}: SeatLayoutRequest): SeatLayoutDetails {
  const trip = getMockTripById(tripId, journeyDate) ?? getFallbackTrip(journeyDate);
  const vehicleLayout = getVehicleLayout(trip.busType);
  const axleType = ["Volvo", "Mercedes", "Luxury"].includes(trip.busType)
    ? "Double Axle"
    : "Single Axle";
  const deckLayouts = createDeckLayouts({
    axleType,
    heldSeats,
    seed: hashString(trip.tripId),
    seatAmount: trip.fare.amount,
    vehicleLayout,
  });

  return {
    supplierCode: trip.supplierCode,
    tripId: trip.tripId,
    maxSelectableSeats: 6,
    holdDurationSeconds: HOLD_DURATION_SECONDS,
    operatorName: trip.operatorName,
    busType: trip.busType,
    vehicleLayout,
    axleType,
    sourceCity: trip.sourceCity,
    destinationCity: trip.destinationCity,
    journeyDate,
    departureTime: trip.departureTime,
    arrivalTime: trip.arrivalTime,
    durationMinutes: trip.durationMinutes,
    routePreview: trip.routePreview,
    boardingPoints: trip.boardingPoints.map((point, index) => enrichPoint(point, index)),
    droppingPoints: trip.droppingPoints.map((point, index) => enrichPoint(point, index + 7)),
    decks: deckLayouts,
  };
}

export function createMockSeatHold(
  request: SeatHoldRequest,
  layout: SeatLayoutDetails,
  now = new Date(),
): SeatHoldResponse {
  const selectable = new Map(
    layout.decks
      .flatMap((deck) => deck.seats)
      .filter((seat) => canHoldSeat(seat))
      .map((seat) => [seat.seatNumber, seat]),
  );
  const selected = [...new Set(request.seatNumbers)];

  if (!selected.length) {
    throw new Error("Select at least one seat");
  }
  if (selected.length > layout.maxSelectableSeats) {
    throw new Error(`You can select up to ${layout.maxSelectableSeats} seats`);
  }
  const unavailableSeat = selected.find((seatNumber) => !selectable.has(seatNumber));
  if (unavailableSeat) {
    throw new Error(`Seat ${unavailableSeat} is already booked or blocked`);
  }

  const expiresAt = new Date(now.getTime() + HOLD_DURATION_SECONDS * 1000).toISOString();

  return {
    reservationId: createId("RES", request.tripId, selected.join("-"), now.toISOString()),
    status: "SEAT_HELD",
    heldSeats: selected,
    expiresAt,
    holdDurationSeconds: HOLD_DURATION_SECONDS,
    fare: calculateFare(selected.map((seatNumber) => selectable.get(seatNumber)).filter(isSeat)),
  };
}

export function releaseMockSeatHold(request: SeatReleaseRequest): SeatReleaseResponse {
  return {
    reservationId: request.reservationId,
    released: true,
    status: "EXPIRED",
  };
}

export function createMockBooking(
  request: CreateBookingRequest,
  layout: SeatLayoutDetails,
  hold: SeatHoldResponse,
  now = new Date(),
): BookingRecord {
  validateBookingRequest(request, layout, hold);
  const trip =
    getMockTripById(request.tripId, request.journeyDate) ?? getFallbackTrip(request.journeyDate);
  const boardingPoint = findPoint(layout.boardingPoints, request.boardingPointId, "boarding");
  const droppingPoint = findPoint(layout.droppingPoints, request.droppingPointId, "dropping");
  const bookingId = createId("BKG", request.tripId, request.reservationId, now.toISOString());

  return {
    bookingId,
    bookingReference: bookingId.replace("BKG-", "VNB-"),
    supplierCode: request.supplierCode,
    supplierBookingId: null,
    pnr: null,
    ticketNumber: null,
    status: "PENDING_PAYMENT",
    trip,
    selectedSeats: [...request.selectedSeats],
    boardingPoint,
    droppingPoint,
    passengers: request.passengers,
    fare: hold.fare,
    reservationId: request.reservationId,
    createdAt: now.toISOString(),
    expiresAt: hold.expiresAt,
    confirmedAt: null,
    emailPrepared: false,
  };
}

export function confirmMockBooking(
  request: ConfirmBookingRequest,
  booking: BookingRecord,
  now = new Date(),
): BookingConfirmationResponse {
  if (booking.status === "EXPIRED") {
    throw new Error("Reservation expired");
  }
  if (!request.paymentReference.trim()) {
    throw new Error("paymentReference is required");
  }

  const pnr = createId("PNR", booking.bookingId, request.paymentReference).replaceAll("-", "");
  const ticketNumber = createId("VNT", booking.bookingId, now.toISOString());
  const confirmedBooking: BookingRecord = {
    ...booking,
    supplierBookingId: createId("MOCKSUP", booking.bookingId),
    pnr,
    ticketNumber,
    status: "TICKET_GENERATED",
    confirmedAt: now.toISOString(),
    expiresAt: null,
    emailPrepared: true,
  };

  return {
    booking: confirmedBooking,
    ticket: createTicketRecord(confirmedBooking, now),
  };
}

export function createTicketRecord(booking: BookingRecord, now = new Date()): TicketRecord {
  const ticketNumber =
    booking.ticketNumber ?? createId("VNT", booking.bookingId, now.toISOString());
  const pnr = booking.pnr ?? createId("PNR", booking.bookingId).replaceAll("-", "");
  const journeyDate = booking.trip.departureTime.slice(0, 10);
  const route = `${booking.trip.sourceCity} to ${booking.trip.destinationCity}`;
  const qrCode = createMockQrCode({
    bookingId: booking.bookingId,
    pnr,
    journeyDate,
    passengerCount: booking.passengers.length,
    verificationUrl: `https://mock.vriddhinexus.local/verify/${booking.bookingId}`,
  });

  return {
    ticketId: createId("TKT", booking.bookingId, ticketNumber),
    bookingId: booking.bookingId,
    bookingReference: booking.bookingReference,
    ticketNumber,
    status: "GENERATED",
    pnr,
    journeyDate,
    operatorName: booking.trip.operatorName,
    busType: booking.trip.busType,
    busNumber: createMockBusNumber(booking.trip.operatorId, booking.trip.tripId),
    route,
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
    qrCode,
    qrPayload: qrCode.data,
    trackingStatus: "COMING_SOON",
    terms: TERMS,
    emergencyContact: booking.passengers[0]?.emergencyContact ?? "Not provided",
    supportContact: {
      phone: "+91-80-4567-8899",
      email: "support@vriddhinexus.example",
      hours: "24x7 booking support",
    },
    issuedAt: booking.confirmedAt ?? now.toISOString(),
    lastDownloadedAt: null,
    lastEmailedAt: null,
  };
}

export function createMockTicketPdf(booking: BookingRecord): TicketPdfResponse {
  const ticket = createTicketRecord(booking);
  const passengerNames = booking.passengers
    .map((passenger) => `${passenger.firstName} ${passenger.lastName} (${passenger.seatNumber})`)
    .join(", ");
  const lines = [
    "Vriddhi Nexus Pvt Ltd",
    "Clean corporate e-ticket - supplier independent",
    "",
    "HEADER",
    `Ticket ID: ${ticket.ticketId}`,
    `Ticket Number: ${ticket.ticketNumber}`,
    `Booking ID: ${booking.bookingId}`,
    `Booking Reference: ${booking.bookingReference}`,
    `PNR: ${ticket.pnr}`,
    `Booking Status: ${ticket.bookingStatus}`,
    "",
    "PASSENGER INFORMATION",
    `Passengers: ${passengerNames}`,
    `Seat Numbers: ${booking.selectedSeats.join(", ")}`,
    `Emergency Contact: ${ticket.emergencyContact}`,
    "",
    "JOURNEY INFORMATION",
    `Journey Date: ${ticket.journeyDate}`,
    `Route: ${ticket.route}`,
    `Departure: ${booking.trip.departureTime}`,
    `Arrival: ${booking.trip.arrivalTime}`,
    `Duration Minutes: ${booking.trip.durationMinutes}`,
    `Boarding: ${booking.boardingPoint.name}, ${booking.boardingPoint.time}`,
    `Dropping: ${booking.droppingPoint.name}, ${booking.droppingPoint.time}`,
    "",
    "BUS INFORMATION",
    `Operator: ${ticket.operatorName}`,
    `Bus Type: ${ticket.busType}`,
    `Bus Number: ${ticket.busNumber}`,
    "",
    "FARE BREAKDOWN",
    `Base Fare: INR ${booking.fare.baseFare.amount}`,
    `Taxes: INR ${booking.fare.taxes.amount}`,
    `Discount: INR ${booking.fare.discount.amount}`,
    `Convenience Fee: INR ${booking.fare.convenienceFee.amount}`,
    `Grand Total: INR ${booking.fare.grandTotal.amount}`,
    "",
    "QR CODE",
    ticket.qrPayload,
    "",
    "TERMS",
    ...TERMS.map((term, index) => `Term ${index + 1}: ${term}`),
    "",
    "SUPPORT INFORMATION",
    `Phone: ${ticket.supportContact.phone}`,
    `Email: ${ticket.supportContact.email}`,
    `Hours: ${ticket.supportContact.hours}`,
    "",
    "FOOTER",
    "This mock ticket is generated by the internal Vriddhi Nexus ticket model.",
  ];

  return {
    ticketId: ticket.ticketId,
    fileName: `${booking.bookingReference}.pdf`,
    mimeType: "application/pdf",
    base64: createPdfBase64(lines),
    downloadStatus: "READY",
  };
}

export function prepareMockBookingEmail(booking: BookingRecord): {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  attachmentFileName: string;
} {
  const primaryPassenger = booking.passengers[0];
  const to = primaryPassenger?.email ?? "traveller@example.com";

  return {
    to,
    subject: `Booking confirmed: ${booking.bookingReference}`,
    htmlBody: `<p>Your booking ${booking.bookingReference} is confirmed for ${booking.trip.sourceCity} to ${booking.trip.destinationCity}.</p>`,
    textBody: `Your booking ${booking.bookingReference} is confirmed for ${booking.trip.sourceCity} to ${booking.trip.destinationCity}.`,
    attachmentFileName: `${booking.bookingReference}.pdf`,
  };
}

export function isHoldExpired(hold: SeatHoldResponse, now = new Date()): boolean {
  return Date.parse(hold.expiresAt) <= now.getTime();
}

export function calculateFare(seats: SeatMapSeat[]): BookingFareSummary {
  const base = seats.reduce((total, seat) => total + seat.fare.amount, 0);
  const taxes = Math.round(base * INDIA_TAX_RATE);
  const discount = seats.length >= 2 ? Math.round(base * 0.04) : 0;
  const convenienceFee = seats.length * CONVENIENCE_FEE_PER_SEAT;
  const grandTotal = base + taxes + convenienceFee - discount;

  return {
    baseFare: money(base),
    taxes: money(taxes),
    discount: money(discount),
    convenienceFee: money(convenienceFee),
    grandTotal: money(grandTotal),
  };
}

function createDeckLayouts({
  axleType,
  heldSeats,
  seatAmount,
  seed,
  vehicleLayout,
}: {
  axleType: "Single Axle" | "Double Axle";
  heldSeats: string[];
  seatAmount: number;
  seed: number;
  vehicleLayout: VehicleLayoutType;
}): SeatDeckLayout[] {
  const sleeper = vehicleLayout === "2+1 Sleeper";
  const semiSleeper = vehicleLayout === "Semi Sleeper";
  const decks: SeatDeck[] = sleeper ? ["LOWER", "UPPER"] : ["LOWER"];
  const rows = sleeper ? 6 : axleType === "Double Axle" ? 12 : 11;
  const columns = 4;

  return decks.map((deck, deckIndex) => ({
    deck,
    label: deck === "LOWER" ? "Lower Deck" : "Upper Deck",
    rows,
    columns,
    aisleAfterColumn: sleeper ? 2 : 2,
    seats: createSeats({
      deck,
      deckIndex,
      heldSeats,
      rows,
      seed,
      seatAmount,
      sleeper,
      semiSleeper,
    }),
  }));
}

function createSeats({
  deck,
  deckIndex,
  heldSeats,
  rows,
  seed,
  seatAmount,
  sleeper,
  semiSleeper,
}: {
  deck: SeatDeck;
  deckIndex: number;
  heldSeats: string[];
  rows: number;
  seed: number;
  seatAmount: number;
  sleeper: boolean;
  semiSleeper: boolean;
}): SeatMapSeat[] {
  const columns = sleeper ? [1, 2, 4] : [1, 2, 3, 4];

  return Array.from({ length: rows }, (_, rowIndex) =>
    columns.map((column) => {
      const seatNumber = createSeatNumber(deck, rowIndex, column, sleeper);
      const seatSeed = seed + deckIndex * 31 + rowIndex * 11 + column * 7;
      const baseStatus = getSeatStatus(seatSeed);
      const status = heldSeats.includes(seatNumber) ? "BLOCKED" : baseStatus;
      const kind: SeatKind = sleeper ? "SLEEPER" : semiSleeper ? "SEMI_SLEEPER" : "SEATER";
      const isWindow = column === 1 || column === 4;
      const isEmergencyExit = rowIndex === Math.floor(rows / 2) && column === 4;
      const hasExtraLegroom = rowIndex === 0 || isEmergencyExit;
      const genderRestriction: "LADIES" | null = status === "LADIES" ? "LADIES" : null;
      const premium =
        (isWindow ? 80 : 0) + (hasExtraLegroom ? 120 : 0) + (kind === "SLEEPER" ? 180 : 0);

      return {
        seatNumber,
        deck,
        row: rowIndex + 1,
        column,
        kind,
        status,
        fare: money(seatAmount + premium),
        isWindow,
        isEmergencyExit,
        hasExtraLegroom,
        genderRestriction,
      };
    }),
  ).flat();
}

function getSeatStatus(seed: number): SeatStatus {
  if (seed % 29 === 0) {
    return "BOOKED";
  }
  if (seed % 23 === 0) {
    return "BLOCKED";
  }
  if (seed % 19 === 0) {
    return "RESERVED";
  }
  if (seed % 13 === 0) {
    return "LADIES";
  }

  return "AVAILABLE";
}

function createSeatNumber(
  deck: SeatDeck,
  rowIndex: number,
  column: number,
  sleeper: boolean,
): string {
  const suffix = String.fromCharCode(64 + column);

  return sleeper
    ? `${deck === "LOWER" ? "L" : "U"}${rowIndex + 1}${suffix}`
    : `${rowIndex + 1}${suffix}`;
}

function canHoldSeat(seat: SeatMapSeat): boolean {
  return seat.status === "AVAILABLE" || seat.status === "LADIES";
}

function getVehicleLayout(busType: string): VehicleLayoutType {
  if (busType.includes("Sleeper") || busType === "Luxury") {
    return "2+1 Sleeper";
  }
  if (busType === "Semi Sleeper") {
    return "Semi Sleeper";
  }
  if (busType === "Volvo") {
    return "Volvo";
  }
  if (busType === "Mercedes") {
    return "Mercedes";
  }

  return "2+2 Seater";
}

function validateBookingRequest(
  request: CreateBookingRequest,
  layout: SeatLayoutDetails,
  hold: SeatHoldResponse,
): void {
  if (isHoldExpired(hold)) {
    throw new Error("Reservation expired");
  }
  if (request.reservationId !== hold.reservationId) {
    throw new Error("Reservation does not match held seats");
  }
  if (request.selectedSeats.length !== request.passengers.length) {
    throw new Error("Passenger count must match selected seats");
  }
  const held = new Set(hold.heldSeats);
  const mismatch = request.selectedSeats.find((seatNumber) => !held.has(seatNumber));
  if (mismatch) {
    throw new Error(`Seat ${mismatch} is not held`);
  }
  const validSeats = new Set(
    layout.decks.flatMap((deck) => deck.seats.map((seat) => seat.seatNumber)),
  );
  const invalidSeat = request.selectedSeats.find((seatNumber) => !validSeats.has(seatNumber));
  if (invalidSeat) {
    throw new Error(`Seat ${invalidSeat} is invalid`);
  }
}

function findPoint(
  points: BoardingDroppingPoint[],
  pointId: string,
  label: "boarding" | "dropping",
): BoardingDroppingPoint {
  const point = points.find((item) => item.id === pointId);
  if (!point) {
    throw new Error(`Select a valid ${label} point`);
  }

  return point;
}

function enrichPoint(point: BusPoint, seed: number): BoardingDroppingPoint {
  const landmarks = ["main gate", "metro pillar", "fuel station", "temple arch", "mall entrance"];

  return {
    ...point,
    landmark: `Near ${landmarks[seed % landmarks.length]}`,
  };
}

function getFallbackTrip(journeyDate: string) {
  const fallback = getMockTripById("mock-route-001-1", journeyDate);
  if (!fallback) {
    throw new Error("Mock trip inventory is unavailable");
  }

  return fallback;
}

function createId(prefix: string, ...parts: string[]): string {
  const hash = hashString(parts.join("|")).toString(36).toUpperCase().padStart(8, "0").slice(0, 8);

  return `${prefix}-${hash}`;
}

function createMockBusNumber(operatorId: string, tripId: string): string {
  const seed = hashString(`${operatorId}|${tripId}`);
  const district = String(seed % 99).padStart(2, "0");
  const suffix = String(seed % 9999).padStart(4, "0");

  return `KA-${district}-VN-${suffix}`;
}

function createMockQrCode(payload: TicketQrCode["payload"]): TicketQrCode {
  const data = JSON.stringify(payload);
  const modules = 21;
  const cell = 6;
  const quiet = cell * 2;
  const size = modules * cell + quiet * 2;
  const squares: string[] = [];

  for (let row = 0; row < modules; row += 1) {
    for (let column = 0; column < modules; column += 1) {
      const finder =
        isFinderCell(row, column) ||
        isFinderCell(row, modules - column - 1) ||
        isFinderCell(modules - row - 1, column);
      const dark = finder || (hashString(`${data}|${row}|${column}`) + row + column) % 3 === 0;

      if (dark) {
        squares.push(
          `<rect x="${quiet + column * cell}" y="${quiet + row * cell}" width="${cell}" height="${cell}" />`,
        );
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ticket verification QR code" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="#ffffff"/><g fill="#1d4ed8">${squares.join("")}</g></svg>`;

  return {
    payload,
    data,
    svg,
    dataUrl: `data:image/svg+xml;base64,${encodeBase64(svg)}`,
  };
}

function isFinderCell(row: number, column: number): boolean {
  return (
    row < 7 &&
    column < 7 &&
    (row === 0 ||
      row === 6 ||
      column === 0 ||
      column === 6 ||
      (row >= 2 && row <= 4 && column >= 2 && column <= 4))
  );
}

function hashString(value: string): number {
  return [...value].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
}

function money(amount: number): Money {
  return {
    amount,
    currency: "INR",
  };
}

function isSeat(value: SeatMapSeat | undefined): value is SeatMapSeat {
  return Boolean(value);
}

function createPdfBase64(lines: string[]): string {
  const content = lines
    .flatMap((line, index) => [`BT /F1 10 Tf 48 ${770 - index * 18} Td (${escapePdf(line)}) Tj ET`])
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
