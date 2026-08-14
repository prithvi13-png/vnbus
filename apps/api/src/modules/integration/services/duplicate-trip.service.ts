import { Injectable } from "@nestjs/common";
import type { BusSearchResult, DuplicateTripGroup } from "@vnbus/types";

@Injectable()
export class DuplicateTripDetectionService {
  detect(trips: BusSearchResult[]): DuplicateTripGroup[] {
    const groups = new Map<string, BusSearchResult[]>();

    for (const trip of trips) {
      const key = [
        trip.operatorName.toLowerCase(),
        trip.sourceCity.toLowerCase(),
        trip.destinationCity.toLowerCase(),
        trip.departureTime,
        trip.arrivalTime,
        trip.busType.toLowerCase(),
      ].join("|");
      groups.set(key, [...(groups.get(key) ?? []), trip]);
    }

    return [...groups.values()]
      .filter((group) => group.length > 1)
      .map((group, index) => ({
        duplicateGroupId: `DUP-${String(index + 1).padStart(4, "0")}`,
        confidence: 0.92,
        reason:
          "Same operator, route, departure, arrival, bus type, and journey date across supplier inventory.",
        tripRefs: group.map((trip) => `${trip.supplierCode}:${trip.tripId}`),
      }));
  }
}
