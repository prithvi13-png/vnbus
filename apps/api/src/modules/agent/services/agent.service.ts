import { Injectable, Optional } from "@nestjs/common";
import type {
  AgentDashboardResponse,
  AgentRouteMetric,
  AgentStatusSummary,
  BookingRecord,
} from "@vnbus/types";

import { BookingService } from "../../booking/services/booking.service";
import { CustomerService } from "../../customer/services/customer.service";
import { NotificationService } from "../../notification/services/notification.service";
import { AgentSummaryDto } from "../dto/agent-summary.dto";
import type { AgentModulePort } from "../interfaces/agent.interface";
import { AgentMapper } from "../mappers/agent.mapper";
import { AgentRepository } from "../repositories/agent.repository";
import { AgentModuleValidator } from "../validators/agent.validator";

@Injectable()
export class AgentService implements AgentModulePort {
  constructor(
    private readonly repository: AgentRepository,
    private readonly validator: AgentModuleValidator,
    private readonly mapper: AgentMapper,
    @Optional() private readonly bookingService?: BookingService,
    @Optional() private readonly customerService?: CustomerService,
    @Optional() private readonly notificationService?: NotificationService,
  ) {}

  getSummary(): AgentSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new AgentSummaryDto(summary);
  }

  getDashboard(): AgentDashboardResponse {
    const profile = this.repository.getProfile();
    this.validator.ensureActive(profile);
    const bookings = this.bookingService?.listBookings() ?? [];
    const today = new Date().toISOString().slice(0, 10);
    const todaysBookings = bookings.filter((booking) => booking.createdAt.startsWith(today));
    const upcomingJourneys = bookings.filter(
      (booking) =>
        Date.parse(booking.trip.departureTime) >= Date.now() &&
        !["CANCELLED", "FAILED", "EXPIRED"].includes(booking.status),
    );
    const cancelledBookings = bookings.filter((booking) => booking.status === "CANCELLED");

    return this.mapper.toDashboard({
      profile,
      metrics: {
        todaysBookings: todaysBookings.length,
        upcomingJourneys: upcomingJourneys.length,
        todaysRevenue: {
          amount: todaysBookings.reduce(
            (total, booking) => total + booking.fare.grandTotal.amount,
            0,
          ),
          currency: "INR",
        },
        cancelledBookings: cancelledBookings.length,
      },
      recentCustomers: this.customerService?.listRecent(5) ?? [],
      recentActivity: this.repository.listActivity(8),
      quickBookingRoutes: routeMetrics(bookings).slice(0, 4),
      popularRoutes: routeMetrics(bookings).slice(0, 6),
      bookingStatusSummary: statusSummary(bookings),
      notifications: this.notificationService?.listNotifications().slice(0, 6) ?? [],
    });
  }

  recordActivity(input: Parameters<AgentRepository["appendActivity"]>[0]): void {
    this.repository.appendActivity(input);
  }
}

function routeMetrics(bookings: BookingRecord[]): AgentRouteMetric[] {
  const grouped = new Map<string, AgentRouteMetric>();
  const fallbackRoutes: AgentRouteMetric[] = [
    { route: "Bangalore to Hyderabad", bookings: 18, revenue: { amount: 28800, currency: "INR" } },
    { route: "Chennai to Coimbatore", bookings: 11, revenue: { amount: 13200, currency: "INR" } },
    { route: "Pune to Goa", bookings: 8, revenue: { amount: 11600, currency: "INR" } },
    { route: "Mumbai to Pune", bookings: 7, revenue: { amount: 6300, currency: "INR" } },
  ];

  bookings.forEach((booking) => {
    const route = `${booking.trip.sourceCity} to ${booking.trip.destinationCity}`;
    const current = grouped.get(route) ?? {
      route,
      bookings: 0,
      revenue: { amount: 0, currency: "INR" as const },
    };

    grouped.set(route, {
      ...current,
      bookings: current.bookings + 1,
      revenue: {
        amount: current.revenue.amount + booking.fare.grandTotal.amount,
        currency: "INR",
      },
    });
  });

  const values = [...grouped.values()].sort((left, right) => right.bookings - left.bookings);

  return values.length ? values : fallbackRoutes;
}

function statusSummary(bookings: BookingRecord[]): AgentStatusSummary[] {
  const seed: AgentStatusSummary[] = [
    { status: "TICKET_GENERATED", count: 12 },
    { status: "PENDING_PAYMENT", count: 3 },
    { status: "RESCHEDULED", count: 2 },
    { status: "CANCELLED", count: 1 },
  ];

  if (!bookings.length) {
    return seed;
  }

  return Object.entries(
    bookings.reduce<Record<string, number>>((summary, booking) => {
      summary[booking.status] = (summary[booking.status] ?? 0) + 1;

      return summary;
    }, {}),
  ).map(([status, count]) => ({
    status: status as AgentStatusSummary["status"],
    count,
  }));
}
