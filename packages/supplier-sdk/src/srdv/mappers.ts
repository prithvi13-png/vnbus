import type { SeatBlockResponse, SupplierConfirmBookingResponse } from "../index.js";
import type {
  BoardingDroppingPoint,
  Cancellation,
  BusAmenity,
  BusPoint,
  BusSearchResult,
  Money,
  SeatDeckLayout,
  SeatLayoutDetails,
  SeatMapSeat,
} from "@vnbus/types";

import type {
  SrdvBlockResponse,
  SrdvBookResponse,
  SrdvCancelResponse,
  SrdvBlockSeat,
  SrdvBoardingPointDetailsResponse,
  SrdvCancellationPolicy,
  SrdvPoint,
  SrdvPointDetail,
  SrdvPrice,
  SrdvSearchResult,
  SrdvSeat,
  SrdvSeatGrid,
  SrdvSeatLayoutResponse,
} from "./types.js";

/** SRDV sends booleans as the strings "true"/"false". */
function bool(value: string | undefined): boolean {
  return value === "true";
}

function num(value: string | number | undefined, fallback = 0): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  const parsed = Number.parseFloat(value ?? "");

  return Number.isFinite(parsed) ? parsed : fallback;
}

function money(amount: number): Money {
  return { amount, currency: "INR" };
}

/** IST is a fixed +05:30 with no daylight saving, so a constant is safe. */
const IST_OFFSET_MS = 330 * 60 * 1000;

/**
 * Builds an instant from an IST wall-clock reading without going through the
 * host's timezone. Date.UTC normalises out-of-range parts, so a day of 32 or
 * an hour of 25 rolls forward correctly.
 */
function istPartsToIso(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  seconds = 0,
): string {
  return new Date(
    Date.UTC(year, month - 1, day, hours, minutes, seconds) - IST_OFFSET_MS,
  ).toISOString();
}

/**
 * SRDV sends wall-clock timestamps with no offset ("2025-07-30T18:00:00") and
 * labels those same instants IST in its own cancellation text, so they are
 * read as IST. Handing the string to `new Date()` instead would read it in the
 * server's zone — correct only on an IST box, and 5h30m late on a UTC one,
 * which is what our containers run.
 */
export function srdvTimeToIso(value: string): string {
  const parts = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());

  if (!parts) {
    // Anything carrying its own offset is already unambiguous.
    return new Date(value).toISOString();
  }

  const [, year, month, day, hours, minutes, seconds] = parts;

  return istPartsToIso(
    Number(year),
    Number(month),
    Number(day),
    Number(hours),
    Number(minutes),
    seconds ? Number(seconds) : 0,
  );
}

/**
 * Boarding/dropping points carry a time of day ("18:00") with no date, so the
 * journey date is applied to produce a real timestamp. A point earlier in the
 * clock than departure belongs to the next day (an 04:00 drop on a 22:00
 * departure), which is why the caller passes the departure for comparison.
 *
 * The clock reading is IST, so it is assembled in IST rather than with
 * setHours, which would resolve against the server's zone instead.
 */
export function toBusPoint(point: SrdvPoint, journeyDate: string, after?: string): BusPoint {
  const [hours = "0", minutes = "0"] = point.Time.split(":");
  const [year = "1970", month = "01", day = "01"] = journeyDate.split("-");
  const atHour = Number.parseInt(hours, 10);
  const atMinute = Number.parseInt(minutes, 10);
  let time = istPartsToIso(Number(year), Number(month), Number(day), atHour, atMinute);

  if (after && Date.parse(time) < Date.parse(after)) {
    time = istPartsToIso(Number(year), Number(month), Number(day) + 1, atHour, atMinute);
  }

  return {
    id: point.Id,
    name: point.Name.trim(),
    city: point.Location.trim(),
    address: point.Address.trim(),
    time,
    latitude: 0,
    longitude: 0,
  };
}

/**
 * A row can carry several fare classes. The headline is DisplayFare, which is
 * what the operator wants shown; the cheapest Price row is the fallback when
 * DisplayFare is absent.
 */
export function toFare(result: SrdvSearchResult): Money {
  const display = num(result.DisplayFare, Number.NaN);
  if (Number.isFinite(display)) {
    return money(display);
  }

  const cheapest = [...(result.Price ?? [])].sort(
    (a, b) => num(a.PublishedFare) - num(b.PublishedFare),
  )[0];

  return money(num(cheapest?.PublishedFare));
}

/** SRDV states GST explicitly per fare row, so it is read rather than assumed. */
export function toGstBreakdown(price: SrdvPrice | undefined): {
  baseFare: Money;
  tax: Money;
  gstRatePercent: number;
} {
  return {
    baseFare: money(num(price?.GstTaxableAmount ?? price?.BaseFare)),
    tax: money(num(price?.GstAmount ?? price?.Tax)),
    gstRatePercent: num(price?.GstRate, 5),
  };
}

/**
 * SRDV's search row exposes no amenity list — only feature flags. Just the one
 * that maps to a real BusAmenity is claimed; air-conditioning is already
 * carried in BusType ("Volvo A/C Seater"), so it is not invented here.
 */
function toAmenities(result: SrdvSearchResult): BusAmenity[] {
  return bool(result.LiveTracking) ? ["Live Tracking"] : [];
}

function layoutType(result: SrdvSearchResult): "SEATER" | "SLEEPER" | "MIXED" {
  const seater = bool(result.Seater);
  const sleeper = bool(result.Sleeper);

  if (seater && sleeper) {
    return "MIXED";
  }

  return sleeper ? "SLEEPER" : "SEATER";
}

export interface SrdvTripExtras {
  srdvIndex: number;
  resultIndex: string;
  maxSeatsPerTicket: number;
  partialCancellationAllowed: boolean;
  idProofRequired: boolean;
  isDropPointMandatory: boolean;
  cancellationPolicies: SrdvCancellationPolicy[];
}

/**
 * SRDV names the cities only as a combined "BusRoute" ("Bangalore-Hyderabad"),
 * which can list waypoints too, so the searched cities are passed in rather
 * than parsed out of it.
 */
export function toBusSearchResult(
  result: SrdvSearchResult,
  context: {
    sourceCity: string;
    destinationCity: string;
    journeyDate: string;
    /** Search-response TraceId; every follow-up SRDV call requires it. */
    traceId: string;
  },
): BusSearchResult & { srdv: SrdvTripExtras } {
  const departureTime = srdvTimeToIso(result.DepartureTime);
  const arrivalTime = srdvTimeToIso(result.ArrivalTime);

  return {
    supplierCode: "SRDV",
    // ResultIndex is the handle every later SRDV call needs.
    // Carries TraceId + SrdvIndex + ResultIndex, which every follow-up SRDV
    // call needs, plus MaxSeatsPerTicket which only Search reports.
    tripId: encodeSrdvTripId({
      traceId: context.traceId,
      srdvIndex: String(result.SrdvIndex),
      resultIndex: result.ResultIndex,
      maxSeatsPerTicket: num(result.MaxSeatsPerTicket, 6),
    }),
    operatorName: result.TravelsName.trim(),
    busType: result.BusType.trim(),
    sourceCity: context.sourceCity,
    destinationCity: context.destinationCity,
    departureTime,
    arrivalTime,
    durationMinutes: num(result.Duration),
    availableSeats: num(result.AvailableSeats),
    fare: toFare(result),
    routeId: result.RouteId,
    operatorId: result.OperatorId,
    operatorLogoUrl: "",
    busImageUrl: "",
    amenities: toAmenities(result),
    boardingPoints: (result.BoardingPoints ?? []).map((point) =>
      toBusPoint(point, context.journeyDate),
    ),
    droppingPoints: (result.DroppingPoints ?? []).map((point) =>
      toBusPoint(point, context.journeyDate, departureTime),
    ),
    // SRDV's search response carries no ratings or review counts. Zero is
    // honest here; inventing a rating would put a number on the card that no
    // passenger ever gave.
    rating: 0,
    reviewCount: 0,
    reviews: { rating: 0, reviewCount: 0, positiveTags: [] },
    discountLabel: null,
    discountAmount: num(result.Price?.[0]?.Discount),
    liveTracking: bool(result.LiveTracking),
    popularityScore: 0,
    // SRDV gives no coordinates or distance, so the preview carries the city
    // names it does give and leaves the geometry at zero rather than inventing
    // a map position.
    routePreview: {
      from: { city: context.sourceCity, latitude: 0, longitude: 0 },
      to: { city: context.destinationCity, latitude: 0, longitude: 0 },
      distanceKm: 0,
      mapBounds: [0, 0, 0, 0],
    },
    seatLayout: {
      // Search returns only what is free, never the bus's capacity — that
      // arrives with the seat-layout call. 0 marks it unknown; copying
      // AvailableSeats here would advertise every bus as completely empty.
      totalSeats: 0,
      availableSeats: num(result.AvailableSeats),
      decks: bool(result.Sleeper) ? 2 : 1,
      layoutType: layoutType(result),
    },
    srdv: {
      srdvIndex: result.SrdvIndex,
      resultIndex: result.ResultIndex,
      maxSeatsPerTicket: num(result.MaxSeatsPerTicket, 6),
      partialCancellationAllowed: bool(result.PartialCancellationAllowed),
      idProofRequired: bool(result.IdProofRequired),
      isDropPointMandatory: bool(result.IsDropPointMandatory),
      cancellationPolicies: result.CancellationPolicies ?? [],
    },
  };
}

/**
 * SRDV's follow-up calls each need TraceId + SrdvIndex + ResultIndex together,
 * but SupplierAdapter carries a single opaque tripId. All three are packed into
 * it, plus MaxSeatsPerTicket, which only Search reports and which the seat
 * layout screen needs. The separator is "~" because SRDV's own ids are numeric
 * strings and never contain it.
 */
const TRIP_ID_SEPARATOR = "~";

export interface SrdvTripRef {
  traceId: string;
  srdvIndex: string;
  resultIndex: string;
  maxSeatsPerTicket: number;
}

export function encodeSrdvTripId(ref: SrdvTripRef): string {
  return [ref.traceId, ref.srdvIndex, ref.resultIndex, ref.maxSeatsPerTicket].join(
    TRIP_ID_SEPARATOR,
  );
}

/** Returns null for anything not produced by encodeSrdvTripId. */
export function decodeSrdvTripId(tripId: string): SrdvTripRef | null {
  const parts = tripId.split(TRIP_ID_SEPARATOR);

  if (parts.length !== 4) {
    return null;
  }

  const [traceId, srdvIndex, resultIndex, maxSeats] = parts;

  if (!traceId || !srdvIndex || !resultIndex) {
    return null;
  }

  return {
    traceId,
    srdvIndex,
    resultIndex,
    maxSeatsPerTicket: num(maxSeats, 0),
  };
}

/** SRDV spells its seat kinds in prose; map to the VNBUS enum. */
function toSeatKind(seatType: string): "SEATER" | "SLEEPER" | "SEMI_SLEEPER" {
  const normalized = seatType.toLowerCase();

  if (normalized.includes("semi")) {
    return "SEMI_SLEEPER";
  }

  return normalized.includes("sleeper") ? "SLEEPER" : "SEATER";
}

/**
 * SeatStatus "true" means the seat is FREE. Verified arithmetically against the
 * documented sample: 28 seats, 26 with SeatStatus "true", AvailableSeats "26".
 * Reading it as "occupied" would invert the entire seat map.
 *
 * A free seat reserved for one gender is surfaced through genderRestriction;
 * LADIES is also a distinct status in the VNBUS model, so it is used when set.
 */
function toSeatStatus(seat: SrdvSeat): "AVAILABLE" | "BOOKED" | "LADIES" | "RESERVED" {
  if (!bool(seat.SeatStatus)) {
    return "BOOKED";
  }
  if (bool(seat.IsLadiesSeat)) {
    return "LADIES";
  }
  if (bool(seat.ReservedForSocialDistancing)) {
    return "RESERVED";
  }

  return "AVAILABLE";
}

function toGenderRestriction(seat: SrdvSeat): "LADIES" | "MALE" | null {
  if (bool(seat.IsLadiesSeat)) {
    return "LADIES";
  }

  return bool(seat.IsMalesSeat) ? "MALE" : null;
}

/**
 * The customer price is PublishedFare (gross). SeatFare and OfferedFare are net
 * of agent commission — cost prices that must never be shown to a passenger.
 */
function toSeatFare(seat: SrdvSeat): Money {
  return money(num(seat.Price?.PublishedFare, num(seat.SeatFare)));
}

function toDeckSeats(grid: SrdvSeatGrid | undefined, deck: "LOWER" | "UPPER"): SeatMapSeat[] {
  const seats: SeatMapSeat[] = [];

  for (const row of Object.values(grid ?? {})) {
    for (const seat of Object.values(row ?? {})) {
      if (!seat || typeof seat.SeatName !== "string") {
        continue;
      }

      seats.push({
        seatNumber: seat.SeatName,
        deck,
        row: num(seat.RowNo),
        column: num(seat.ColumnNo),
        kind: toSeatKind(seat.SeatType ?? ""),
        status: toSeatStatus(seat),
        fare: toSeatFare(seat),
        // SRDV reports no window/legroom/emergency-exit attributes. Column
        // position does not reliably imply a window across coach layouts, so
        // these stay false rather than being inferred.
        isWindow: false,
        isEmergencyExit: false,
        hasExtraLegroom: false,
        genderRestriction: toGenderRestriction(seat),
      });
    }
  }

  return seats.sort((left, right) => left.row - right.row || left.column - right.column);
}

function toDeckLayout(
  grid: SrdvSeatGrid | undefined,
  deck: "LOWER" | "UPPER",
): SeatDeckLayout | null {
  const seats = toDeckSeats(grid, deck);

  if (seats.length === 0) {
    return null;
  }

  // The grid is sparse — SRDV numbers rows/columns in steps of two — so extent
  // comes from the highest index present, not the seat count.
  const rows = Math.max(...seats.map((seat) => seat.row)) + 1;
  const columns = Math.max(...seats.map((seat) => seat.column)) + 1;

  return {
    deck,
    label: deck === "LOWER" ? "Lower deck" : "Upper deck",
    rows,
    columns,
    // SRDV does not say where the aisle falls; 0 means "unspecified" rather
    // than claiming a position the renderer would draw wrongly.
    aisleAfterColumn: 0,
    seats,
  };
}

/**
 * GetSeatLayOut -> VNBUS SeatLayoutDetails.
 *
 * The response carries only the seat grid; everything describing the journey
 * (operator, cities, times, boarding points, route) comes from Search and is
 * passed in by the caller. Fields neither source provides are left empty rather
 * than invented — see the notes on each.
 */
export function toSeatLayout(
  response: SrdvSeatLayoutResponse,
  context: {
    supplierCode: string;
    tripId: string;
    journeyDate: string;
    maxSelectableSeats: number;
  },
): SeatLayoutDetails {
  const decks = [
    toDeckLayout(response.Result, "LOWER"),
    toDeckLayout(response.ResultUpperSeat, "UPPER"),
  ].filter((deck): deck is SeatDeckLayout => deck !== null);

  return {
    supplierCode: context.supplierCode,
    tripId: context.tripId,
    maxSelectableSeats: context.maxSelectableSeats,
    // SRDV does not return a hold window from GetSeatLayOut; Block governs it.
    holdDurationSeconds: 0,
    // Journey description belongs to the Search result, not this response.
    operatorName: "",
    busType: "",
    vehicleLayout: "Semi Sleeper",
    axleType: "Single Axle",
    sourceCity: "",
    destinationCity: "",
    journeyDate: context.journeyDate,
    departureTime: "",
    arrivalTime: "",
    durationMinutes: 0,
    routePreview: {
      from: { city: "", latitude: 0, longitude: 0 },
      to: { city: "", latitude: 0, longitude: 0 },
      distanceKm: 0,
      mapBounds: [0, 0, 0, 0],
    },
    boardingPoints: [],
    droppingPoints: [],
    decks,
  };
}

/**
 * GetBoardingPointDetails point -> VNBUS BoardingDroppingPoint.
 *
 * `id` takes SRDV's `Id`, the same identifier Search returns for its points.
 * The response also carries `MasterId`, whose role is undocumented — until
 * Block's contract says which of the two its BoardingPointId expects, `Id` is
 * the only one with corroboration, and `MasterId` is deliberately not guessed
 * at here.
 *
 * Times are an IST "HH:mm" against the journey date, with the same next-day
 * rollover Search needs: a 06:00 drop on a 20:00 departure is the next morning.
 */
export function toPointDetail(
  point: SrdvPointDetail,
  journeyDate: string,
  after?: string,
): BoardingDroppingPoint {
  const base = toBusPoint(
    {
      Id: point.Id,
      Name: point.Name,
      Address: point.Address,
      Location: point.Location,
      Landmark: point.Landmark,
      ContactNumber: point.ContactNumber,
      Time: point.Time,
      IsPrime: "false",
    },
    journeyDate,
    after,
  );

  return { ...base, landmark: point.Landmark?.trim() ?? "" };
}

export interface SrdvPointDetails {
  boardingPoints: BoardingDroppingPoint[];
  droppingPoints: BoardingDroppingPoint[];
}

/**
 * Both point lists arrive in one response, so the latest boarding time stands
 * in for departure and anchors the dropping points' rollover. Without that
 * anchor every overnight drop would land before its own pickup.
 */
export function toPointDetails(
  response: SrdvBoardingPointDetailsResponse,
  journeyDate: string,
): SrdvPointDetails {
  const boardingPoints = (response.BoardingPoints ?? []).map((point) =>
    toPointDetail(point, journeyDate),
  );
  const departure = boardingPoints
    .map((point) => Date.parse(point.time))
    .filter((time) => !Number.isNaN(time))
    .sort((left, right) => right - left)[0];
  const after = departure === undefined ? undefined : new Date(departure).toISOString();

  return {
    boardingPoints,
    droppingPoints: (response.DroppingPoints ?? []).map((point) =>
      toPointDetail(point, journeyDate, after),
    ),
  };
}

/**
 * VNBUS gender -> SRDV's numeric code.
 *
 * The documented example pairs Title "Mr" with Gender "1", so male = "1" is
 * evidenced. Female = "2" is the conventional counterpart but is NOT in the
 * supplied documentation — confirm with SRDV before trusting a live female
 * booking. OTHER has no documented code at all and falls back to "1" rather
 * than sending a value SRDV has never defined.
 */
export function toSrdvGender(gender: "MALE" | "FEMALE" | "OTHER" | undefined): string {
  return gender === "FEMALE" ? "2" : "1";
}

/**
 * Block's own seat price. PublishedFare is the passenger price; SeatFare and
 * OfferedFare are commission-net cost prices and must not be charged.
 */
function toBlockSeatFare(seat: SrdvBlockSeat | undefined): number {
  return num(seat?.Price?.PublishedFare, num(seat?.SeatFare));
}

/**
 * Block -> VNBUS SeatBlockResponse.
 *
 * `expiresAt` is left empty: SRDV returns no hold window, and inventing one
 * would promise the customer a reservation deadline the supplier never gave —
 * a shorter real window would drop the seat mid-payment.
 *
 * The fare is the sum of each passenger seat's PublishedFare, not the
 * top-level `Price.BaseFare`, which excludes tax.
 */
export function toSeatBlock(response: SrdvBlockResponse): SeatBlockResponse {
  const passengers = response.Passengers ?? [];
  const amount = passengers.reduce(
    (total, passenger) => total + toBlockSeatFare(passenger.Seat),
    0,
  );

  return {
    blockId: response.BlockKey ?? "",
    expiresAt: "",
    fare: money(amount > 0 ? amount : num(response.Price?.BaseFare)),
  };
}

/**
 * Book -> VNBUS SupplierConfirmBookingResponse.
 *
 * `ErrorCode: 0` alone does not mean a seat was sold: the outcome lives in
 * `Result.BusBookingStatus`, and only "Success" is a booking. Anything else is
 * reported as FAILED so the money path never treats a non-booking as confirmed.
 */
export function toConfirmedBooking(response: SrdvBookResponse): SupplierConfirmBookingResponse {
  const result = response.Result ?? {};
  const succeeded = result.BusBookingStatus?.trim().toLowerCase() === "success";

  return {
    supplierBookingId: response.BookingId === undefined ? "" : String(response.BookingId),
    pnr: result.TravelOperatorPNR ?? "",
    ticketNumber: result.TicketNo ?? "",
    status: succeeded ? "CONFIRMED" : "FAILED",
  };
}

/** True when SRDV reports the booking actually completed. */
export function isSrdvBookingSuccessful(response: SrdvBookResponse): boolean {
  return response.Result?.BusBookingStatus?.trim().toLowerCase() === "success";
}

/**
 * Cancel -> VNBUS Cancellation.
 *
 * SRDV answers "In Process": the request was accepted, not completed. That maps
 * to REQUESTED, never CONFIRMED — telling a customer their cancellation is
 * confirmed when the supplier has only queued it is how refunds go missing.
 *
 * SRDV returns no penalty figure, so it stays zero; the real deduction follows
 * from the trip's CancellationPolicies and the supplier's own settlement.
 */
export function toCancellation(
  response: SrdvCancelResponse,
  context: { bookingId: string; supplierBookingId?: string | null },
): Cancellation {
  const status = response.Status?.trim().toLowerCase() ?? "";
  const accepted = status === "in process" || status === "success" || status === "cancelled";

  return {
    bookingId: context.bookingId,
    supplierBookingId: context.supplierBookingId ?? null,
    status: accepted ? "REQUESTED" : "FAILED",
    // Nothing is refunded until SRDV settles the cancellation.
    refundStatus: accepted ? "PENDING" : "NOT_APPLICABLE",
    penalty: money(0),
  };
}
