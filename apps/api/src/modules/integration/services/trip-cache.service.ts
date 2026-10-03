import { Injectable } from "@nestjs/common";
import type { BusSearchResult } from "@vnbus/types";

/**
 * How long a searched trip stays bookable. A supplier's search session expires
 * on its side too (SRDV's TraceId), so holding trips longer would only let a
 * traveller pick a seat the supplier no longer recognises.
 */
const TRIP_TTL_MS = 30 * 60 * 1000;
const MAX_TRIPS = 20_000;

/**
 * Trips from recent searches, keyed by tripId.
 *
 * A supplier's seat map and booking calls describe seats only; the operator,
 * times, cities and boarding points are in the search result. Keeping that
 * result here lets the seat map and the booking use the supplier's own trip
 * data instead of trusting whatever the browser sends back.
 *
 * In-process, so a trip searched on one API instance is unknown to another;
 * a traveller who lands elsewhere is asked to search again.
 */
@Injectable()
export class TripCacheService {
  private readonly trips = new Map<string, { trip: BusSearchResult; expiresAt: number }>();

  remember(trips: BusSearchResult[], now = Date.now()): void {
    for (const trip of trips) {
      this.trips.delete(trip.tripId);
      this.trips.set(trip.tripId, { trip, expiresAt: now + TRIP_TTL_MS });
    }

    this.evict(now);
  }

  find(tripId: string, now = Date.now()): BusSearchResult | null {
    const entry = this.trips.get(tripId);

    if (!entry) {
      return null;
    }
    if (entry.expiresAt <= now) {
      this.trips.delete(tripId);

      return null;
    }

    return entry.trip;
  }

  /** Fresh trips between two cities, from whatever searches ran recently. */
  findByRoute(sourceCity: string, destinationCity: string, now = Date.now()): BusSearchResult[] {
    const from = sourceCity.trim().toLowerCase();
    const to = destinationCity.trim().toLowerCase();

    return [...this.trips.values()]
      .filter(
        (entry) =>
          entry.expiresAt > now &&
          entry.trip.sourceCity.toLowerCase() === from &&
          entry.trip.destinationCity.toLowerCase() === to,
      )
      .map((entry) => entry.trip);
  }

  private evict(now: number): void {
    for (const [tripId, entry] of this.trips) {
      if (entry.expiresAt <= now || this.trips.size > MAX_TRIPS) {
        this.trips.delete(tripId);
      } else {
        // Insertion order is expiry order, so the rest are still fresh.
        break;
      }
    }
  }
}
