import { Injectable } from "@nestjs/common";
import type { AdminAnalyticsResponse, AdminChartPoint } from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

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

@Injectable()
export class AnalyticsRepository {
  findSummary(): ModuleSummary {
    return summary;
  }

  getAdminAnalytics(): AdminAnalyticsResponse {
    const weekly = chartPoints();

    return {
      revenue: weekly,
      bookings: weekly,
      users: weekly.map((point) => ({
        ...point,
        bookings: point.users ?? 0,
        revenue: (point.users ?? 0) * 120,
      })),
      routes: [
        {
          route: "Bangalore to Hyderabad",
          bookings: 318,
          revenue: { amount: 508800, currency: "INR" },
          cancellationRate: 1.9,
        },
        {
          route: "Chennai to Coimbatore",
          bookings: 242,
          revenue: { amount: 290400, currency: "INR" },
          cancellationRate: 2.4,
        },
        {
          route: "Pune to Goa",
          bookings: 196,
          revenue: { amount: 284200, currency: "INR" },
          cancellationRate: 1.5,
        },
      ],
      journeyTrends: weekly.map((point) => ({
        ...point,
        bookings: Math.round(point.bookings * 0.72),
      })),
      operatorTrends: [
        {
          operatorId: "OP-EASTERN",
          operatorName: "Eastern Travels",
          bookings: 214,
          revenue: { amount: 342600, currency: "INR" },
          rating: 4.6,
          status: "HEALTHY",
        },
        {
          operatorId: "OP-ROYAL",
          operatorName: "Royal Express",
          bookings: 144,
          revenue: { amount: 208800, currency: "INR" },
          rating: 4.2,
          status: "DEGRADED",
        },
      ],
      customerGrowth: weekly.map((point) => ({
        ...point,
        bookings: point.users ?? 0,
        revenue: 0,
      })),
      retention: [
        { label: "Week 1", bookings: 76, revenue: 0 },
        { label: "Week 2", bookings: 68, revenue: 0 },
        { label: "Week 3", bookings: 61, revenue: 0 },
        { label: "Week 4", bookings: 58, revenue: 0 },
      ],
      cancellation: weekly.map((point) => ({
        ...point,
        bookings: point.cancellations ?? 0,
        revenue: 0,
      })),
    };
  }
}

function chartPoints(): AdminChartPoint[] {
  return [
    { label: "Mon", bookings: 118, revenue: 188800, users: 62, cancellations: 3 },
    { label: "Tue", bookings: 142, revenue: 227200, users: 71, cancellations: 4 },
    { label: "Wed", bookings: 136, revenue: 217600, users: 68, cancellations: 5 },
    { label: "Thu", bookings: 168, revenue: 268800, users: 84, cancellations: 6 },
    { label: "Fri", bookings: 191, revenue: 305600, users: 95, cancellations: 5 },
    { label: "Sat", bookings: 224, revenue: 358400, users: 119, cancellations: 8 },
    { label: "Sun", bookings: 149, revenue: 238400, users: 77, cancellations: 4 },
  ];
}
