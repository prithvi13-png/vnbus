import type { BookingStatus, TripSummary } from "@vnbus/types";

export const demoTrips: TripSummary[] = [
  {
    supplierCode: "PENDING",
    tripId: "BLR-HYD-001",
    operatorName: "Vriddhi Express",
    busType: "AC Sleeper 2+1",
    sourceCity: "Bengaluru",
    destinationCity: "Hyderabad",
    departureTime: "2026-08-20T21:45:00+05:30",
    arrivalTime: "2026-08-21T06:25:00+05:30",
    durationMinutes: 520,
    availableSeats: 18,
    fare: { amount: 1450, currency: "INR" },
  },
  {
    supplierCode: "PENDING",
    tripId: "BLR-HYD-002",
    operatorName: "Nexus Primo",
    busType: "Volvo Multi-Axle",
    sourceCity: "Bengaluru",
    destinationCity: "Hyderabad",
    departureTime: "2026-08-20T22:30:00+05:30",
    arrivalTime: "2026-08-21T07:10:00+05:30",
    durationMinutes: 520,
    availableSeats: 11,
    fare: { amount: 1690, currency: "INR" },
  },
];

export const bookings: {
  reference: string;
  route: string;
  date: string;
  status: BookingStatus;
  amount: string;
}[] = [
  {
    reference: "VNB-00010294",
    route: "Bengaluru to Hyderabad",
    date: "20 Aug 2026",
    status: "CONFIRMED",
    amount: "INR 1,450",
  },
  {
    reference: "VNB-00010201",
    route: "Chennai to Coimbatore",
    date: "12 Aug 2026",
    status: "PENDING_PAYMENT",
    amount: "INR 980",
  },
];

export const adminRows: [string, string, string][] = [
  ["Users", "12,408", "Active customer and staff accounts"],
  ["Bookings", "2,941", "Current month bookings"],
  ["Coupons", "38", "Active and scheduled campaigns"],
  ["Audit Logs", "81,220", "Immutable operational events"],
];
