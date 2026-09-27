import type { BusAmenity, BusPoint, BusSearchResult, Money } from "@vnbus/types";

import type { SrdvCancellationPolicy, SrdvPoint, SrdvPrice, SrdvSearchResult } from "./types";

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

/**
 * Boarding/dropping points carry a time of day ("18:00") with no date, so the
 * journey date is applied to produce a real timestamp. A point earlier in the
 * clock than departure belongs to the next day (an 04:00 drop on a 22:00
 * departure), which is why the caller passes the departure for comparison.
 */
export function toBusPoint(point: SrdvPoint, journeyDate: string, after?: string): BusPoint {
  const [hours = "0", minutes = "0"] = point.Time.split(":");
  const stamp = new Date(`${journeyDate}T00:00:00+05:30`);
  stamp.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10), 0, 0);

  if (after && stamp.getTime() < new Date(after).getTime()) {
    stamp.setDate(stamp.getDate() + 1);
  }

  return {
    id: point.Id,
    name: point.Name.trim(),
    city: point.Location.trim(),
    address: point.Address.trim(),
    time: stamp.toISOString(),
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
  context: { sourceCity: string; destinationCity: string; journeyDate: string },
): BusSearchResult & { srdv: SrdvTripExtras } {
  const departureTime = new Date(result.DepartureTime).toISOString();
  const arrivalTime = new Date(result.ArrivalTime).toISOString();

  return {
    supplierCode: "SRDV",
    // ResultIndex is the handle every later SRDV call needs.
    tripId: result.ResultIndex,
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
      totalSeats: num(result.AvailableSeats),
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
