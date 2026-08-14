import { Injectable } from "@nestjs/common";
import type { BusAmenity, BusSearchResult, Money, SupplierCode } from "@vnbus/types";

const AMENITY_ALIASES = new Map<string, BusAmenity>([
  ["wifi", "WiFi"],
  ["wi-fi", "WiFi"],
  ["charging", "Charging Point"],
  ["charging point", "Charging Point"],
  ["gps", "GPS"],
  ["live tracking", "Live Tracking"],
  ["usb charger", "USB Charger"],
]);

@Injectable()
export class NormalizationService {
  normalizeTrips(trips: BusSearchResult[]): BusSearchResult[] {
    return trips.map((trip) => this.normalizeTrip(trip));
  }

  normalizeTrip(trip: BusSearchResult): BusSearchResult {
    return {
      ...trip,
      supplierCode: this.normalizeSupplierCode(trip.supplierCode),
      operatorName: normalizeLabel(trip.operatorName),
      busType: normalizeLabel(trip.busType),
      amenities: [...new Set(trip.amenities.map((amenity) => this.normalizeAmenity(amenity)))],
      departureTime: normalizeIsoDate(trip.departureTime),
      arrivalTime: normalizeIsoDate(trip.arrivalTime),
      durationMinutes: Math.max(0, Math.round(trip.durationMinutes)),
      availableSeats: Math.max(0, trip.availableSeats),
      fare: this.normalizeMoney(trip.fare),
      boardingPoints: trip.boardingPoints.map((point) => ({
        ...point,
        name: normalizeLabel(point.name),
        city: normalizeLabel(point.city),
        time: normalizeIsoDate(point.time),
      })),
      droppingPoints: trip.droppingPoints.map((point) => ({
        ...point,
        name: normalizeLabel(point.name),
        city: normalizeLabel(point.city),
        time: normalizeIsoDate(point.time),
      })),
      rating: Number(trip.rating.toFixed(1)),
      liveTracking: Boolean(trip.liveTracking),
    };
  }

  normalizeMoney(money: Money): Money {
    const amount = Number(money.amount.toFixed(2));

    return {
      amount,
      currency: money.currency,
    };
  }

  normalizeAmenity(amenity: BusAmenity): BusAmenity {
    return AMENITY_ALIASES.get(amenity.toLowerCase()) ?? amenity;
  }

  normalizeSupplierCode(code: string): SupplierCode {
    const normalized = code.trim().toUpperCase();

    if (["MOCK", "BCI", "REDBUS", "ABHIBUS", "TBO", "CUSTOM"].includes(normalized)) {
      return normalized as SupplierCode;
    }

    return "CUSTOM";
  }
}

function normalizeLabel(value: string): string {
  return value
    .trim()
    .replace(/\s+/gu, " ")
    .replace(/\b\w/gu, (letter) => letter.toUpperCase());
}

function normalizeIsoDate(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}
