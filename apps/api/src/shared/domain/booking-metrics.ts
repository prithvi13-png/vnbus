import type {
  AdminChartPoint,
  AdminOperatorMetric,
  AdminRouteMetric,
  BookingRecord,
} from "@vnbus/types";

/** Bookings the supplier actually sold, which are what revenue counts. */
export const SOLD_STATUSES = new Set(["CONFIRMED", "TICKET_GENERATED"]);
export const CANCELLED_STATUSES = new Set([
  "CANCELLATION_REQUESTED",
  "CANCELLED",
  "REFUND_PENDING",
]);
export const DAY_MS = 24 * 60 * 60 * 1000;
/** India has one zone, UTC+05:30, with no daylight saving. */
export const IST_OFFSET_MS = 330 * 60 * 1000;

/** Midnight in India for the day `now` falls on, as a UTC timestamp. */
export function istDayStart(now: Date): number {
  const ist = now.getTime() + IST_OFFSET_MS;

  return ist - (ist % DAY_MS) - IST_OFFSET_MS;
}

export function isSold(booking: BookingRecord): boolean {
  return SOLD_STATUSES.has(booking.status);
}

export function isCancelled(booking: BookingRecord): boolean {
  return CANCELLED_STATUSES.has(booking.status);
}

/** Ticket value of what was actually sold, to the paisa. */
export function sumFares(bookings: BookingRecord[]): number {
  const total = bookings
    .filter(isSold)
    .reduce((sum, booking) => sum + booking.fare.grandTotal.amount, 0);

  return Math.round(total * 100) / 100;
}

export function percentage(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10;
}

export function createdBetween(
  bookings: BookingRecord[],
  start: number,
  end: number,
): BookingRecord[] {
  return bookings.filter((booking) => {
    const createdAt = Date.parse(booking.createdAt);

    return createdAt >= start && createdAt < end;
  });
}

export function chartPoint(label: string, bookings: BookingRecord[]): AdminChartPoint {
  return {
    label,
    bookings: bookings.length,
    revenue: sumFares(bookings),
    cancellations: bookings.filter(isCancelled).length,
  };
}

/** One point per day for the last `days` days, oldest first, by IST date. */
export function dailyTrend(bookings: BookingRecord[], now: Date, days = 7): AdminChartPoint[] {
  const today = istDayStart(now);

  return Array.from({ length: days }, (_, index) => {
    const start = today - (days - 1 - index) * DAY_MS;

    return chartPoint(dayLabel(start), createdBetween(bookings, start, start + DAY_MS));
  });
}

/** One point per week for the last `weeks` weeks, oldest first. */
export function weeklyTrend(bookings: BookingRecord[], now: Date, weeks = 4): AdminChartPoint[] {
  const end = istDayStart(now) + DAY_MS;

  return Array.from({ length: weeks }, (_, index) => {
    const weekEnd = end - (weeks - 1 - index) * 7 * DAY_MS;
    const ago = weeks - 1 - index;

    return chartPoint(
      ago === 0 ? "This week" : `${ago} wk ago`,
      createdBetween(bookings, weekEnd - 7 * DAY_MS, weekEnd),
    );
  });
}

/** One point per calendar month in India for the last `months` months. */
export function monthlyTrend(bookings: BookingRecord[], now: Date, months = 6): AdminChartPoint[] {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);

  return Array.from({ length: months }, (_, index) => {
    const month = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth() - (months - 1 - index), 1);
    const next = Date.UTC(new Date(month).getUTCFullYear(), new Date(month).getUTCMonth() + 1, 1);

    return chartPoint(
      new Date(month).toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      }),
      createdBetween(bookings, month - IST_OFFSET_MS, next - IST_OFFSET_MS),
    );
  });
}

/** One point per calendar year in India for the last `years` years. */
export function yearlyTrend(bookings: BookingRecord[], now: Date, years = 3): AdminChartPoint[] {
  const year = new Date(now.getTime() + IST_OFFSET_MS).getUTCFullYear();

  return Array.from({ length: years }, (_, index) => {
    const label = year - (years - 1 - index);

    return chartPoint(
      String(label),
      createdBetween(
        bookings,
        Date.UTC(label, 0, 1) - IST_OFFSET_MS,
        Date.UTC(label + 1, 0, 1) - IST_OFFSET_MS,
      ),
    );
  });
}

export function popularRoutes(bookings: BookingRecord[], limit = 5): AdminRouteMetric[] {
  return groupBy(
    bookings,
    (booking) => `${booking.trip.sourceCity} to ${booking.trip.destinationCity}`,
  )
    .map(([route, group]) => ({
      route,
      bookings: group.length,
      revenue: { amount: sumFares(group), currency: "INR" as const },
      cancellationRate: percentage(group.filter(isCancelled).length, group.length),
    }))
    .sort((left, right) => right.bookings - left.bookings)
    .slice(0, limit);
}

export function topOperators(bookings: BookingRecord[], limit = 5): AdminOperatorMetric[] {
  return groupBy(bookings.filter(isSold), (booking) => booking.trip.operatorName)
    .map(([operatorName, group]) => ({
      operatorId: group[0]?.trip.operatorId ?? operatorName,
      operatorName,
      bookings: group.length,
      revenue: { amount: sumFares(group), currency: "INR" as const },
      // The supplier reports no operator ratings.
      rating: 0,
      status: "HEALTHY" as const,
    }))
    .sort((left, right) => right.bookings - left.bookings)
    .slice(0, limit);
}

export function groupBy<T>(items: T[], key: (item: T) => string): Array<[string, T[]]> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const name = key(item);
    groups.set(name, [...(groups.get(name) ?? []), item]);
  }

  return [...groups.entries()];
}

function dayLabel(start: number): string {
  return new Date(start + IST_OFFSET_MS).toLocaleDateString("en-IN", {
    weekday: "short",
    timeZone: "UTC",
  });
}
