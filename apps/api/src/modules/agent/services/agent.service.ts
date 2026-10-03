import { Injectable } from "@nestjs/common";
import type {
  AgentDashboardResponse,
  AgentRouteMetric,
  AgentStatusSummary,
  BookingRecord,
} from "@vnbus/types";

import type { JwtPrincipal } from "../../../shared/security/interfaces/jwt-principal.interface";
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
    private readonly bookingService: BookingService,
    private readonly customerService: CustomerService,
    private readonly notificationService: NotificationService,
  ) {}

  getSummary(): AgentSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new AgentSummaryDto(summary);
  }

  async getDashboard(principal: JwtPrincipal): Promise<AgentDashboardResponse> {
    const profile = await this.repository.getProfile(principal.sub);
    this.validator.ensureActive(profile);
    const bookings = await this.bookingService.listBookings(principal);
    const todayStart = istDayStart(new Date());
    const todaysBookings = bookings.filter(
      (booking) => Date.parse(booking.createdAt) >= todayStart,
    );
    const upcomingJourneys = bookings.filter(
      (booking) =>
        Date.parse(booking.trip.departureTime) >= Date.now() &&
        ["CONFIRMED", "TICKET_GENERATED"].includes(booking.status),
    );
    const cancelledBookings = bookings.filter((booking) =>
      ["CANCELLATION_REQUESTED", "CANCELLED", "REFUND_PENDING"].includes(booking.status),
    );
    const routes = routeMetrics(bookings);

    return this.mapper.toDashboard({
      profile,
      metrics: {
        todaysBookings: todaysBookings.length,
        upcomingJourneys: upcomingJourneys.length,
        todaysRevenue: {
          amount: todaysBookings
            .filter((booking) => ["CONFIRMED", "TICKET_GENERATED"].includes(booking.status))
            .reduce((total, booking) => total + booking.fare.grandTotal.amount, 0),
          currency: "INR",
        },
        cancelledBookings: cancelledBookings.length,
      },
      recentCustomers: this.customerService.listRecent(principal, 5),
      recentActivity: this.repository.listActivity(principal.sub, 8),
      quickBookingRoutes: routes.slice(0, 4),
      popularRoutes: routes.slice(0, 6),
      bookingStatusSummary: statusSummary(bookings),
      notifications: this.notificationService.listNotifications(principal.sub).slice(0, 6),
    });
  }

  recordActivity(
    principal: JwtPrincipal,
    input: Parameters<AgentRepository["appendActivity"]>[1],
  ): void {
    this.repository.appendActivity(principal.sub, input);
  }
}

function routeMetrics(bookings: BookingRecord[]): AgentRouteMetric[] {
  const grouped = new Map<string, AgentRouteMetric>();

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

  return [...grouped.values()].sort((left, right) => right.bookings - left.bookings);
}

function statusSummary(bookings: BookingRecord[]): AgentStatusSummary[] {
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

/** India has one zone, UTC+05:30, with no daylight saving. */
const IST_OFFSET_MS = 330 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Midnight in India for the day `now` falls on, as a UTC timestamp. */
function istDayStart(now: Date): number {
  const ist = now.getTime() + IST_OFFSET_MS;

  return ist - (ist % DAY_MS) - IST_OFFSET_MS;
}
