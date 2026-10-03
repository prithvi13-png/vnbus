import { Injectable } from "@nestjs/common";
import type { AdminAnalyticsResponse, AdminChartPoint, BookingRecord } from "@vnbus/types";

import {
  DAY_MS,
  IST_OFFSET_MS,
  chartPoint,
  dailyTrend,
  isSold,
  istDayStart,
  popularRoutes,
  topOperators,
} from "../../../shared/domain/booking-metrics";
import type { ModuleSummary } from "../../../shared/domain/module-summary";
import { PrismaService } from "../../../shared/prisma/prisma.service";

const summary = {
  module: "analytics",
  boundedContext: "Operational analytics",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "KPI read models",
      description: "Prepare booking, search, and revenue metrics.",
    },
    {
      name: "Conversion funnel",
      description: "Represent search-to-booking journey metrics.",
    },
    {
      name: "Role scoped insight",
      description: "Separate admin and agent analytics views.",
    },
  ],
} satisfies ModuleSummary;

/** Admin analytics, counted from real bookings and accounts. */
@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findSummary(): ModuleSummary {
    return summary;
  }

  async getAdminAnalytics(
    bookings: BookingRecord[],
    now = new Date(),
  ): Promise<AdminAnalyticsResponse> {
    const daily = dailyTrend(bookings, now);
    const newUsers = await this.newUsersPerDay(now);

    return {
      revenue: daily,
      bookings: daily,
      users: newUsers,
      routes: popularRoutes(bookings),
      journeyTrends: upcomingDepartures(bookings, now),
      operatorTrends: topOperators(bookings),
      customerGrowth: newUsers,
      // Retention needs repeat-booking cohorts, which are not tracked yet.
      retention: [],
      cancellation: daily.map((point) => ({
        ...point,
        bookings: point.cancellations ?? 0,
        revenue: 0,
      })),
    };
  }

  /** Accounts created on each of the last seven days, as the `bookings` series. */
  private async newUsersPerDay(now: Date): Promise<AdminChartPoint[]> {
    const today = istDayStart(now);
    const since = today - 6 * DAY_MS;
    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: new Date(since) }, deletedAt: null },
      select: { createdAt: true },
    });

    return Array.from({ length: 7 }, (_, index) => {
      const start = since + index * DAY_MS;
      const count = users.filter((user) => {
        const createdAt = user.createdAt.getTime();

        return createdAt >= start && createdAt < start + DAY_MS;
      }).length;

      return {
        label: new Date(start + IST_OFFSET_MS).toLocaleDateString("en-IN", {
          weekday: "short",
          timeZone: "UTC",
        }),
        bookings: count,
        revenue: 0,
        users: count,
      };
    });
  }
}

/** Sold journeys departing on each of the next seven days. */
function upcomingDepartures(bookings: BookingRecord[], now: Date): AdminChartPoint[] {
  const today = istDayStart(now);

  return Array.from({ length: 7 }, (_, index) => {
    const start = today + index * DAY_MS;
    const departing = bookings.filter((booking) => {
      const departure = Date.parse(booking.trip.departureTime);

      return isSold(booking) && departure >= start && departure < start + DAY_MS;
    });

    return chartPoint(
      new Date(start + IST_OFFSET_MS).toLocaleDateString("en-IN", {
        weekday: "short",
        timeZone: "UTC",
      }),
      departing,
    );
  });
}
