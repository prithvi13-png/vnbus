import { Injectable } from "@nestjs/common";
import type {
  AgentReportPoint,
  AgentReportRecord,
  AgentReportsResponse,
  AgentRouteMetric,
  BookingRecord,
} from "@vnbus/types";

import type { JwtPrincipal } from "../../../shared/security/interfaces/jwt-principal.interface";
import { BookingService } from "../../booking/services/booking.service";
import { CustomerService } from "../../customer/services/customer.service";
import { AgentReportMapper } from "../mappers/agent-report.mapper";
import { AgentReportRepository } from "../repositories/agent-report.repository";
import { AgentReportValidator } from "../validators/agent-report.validator";

@Injectable()
export class AgentReportService {
  constructor(
    private readonly repository: AgentReportRepository,
    private readonly validator: AgentReportValidator,
    private readonly bookingService: BookingService,
    private readonly customerService: CustomerService,
    private readonly mapper: AgentReportMapper,
  ) {}

  /** Reports over the signed-in agent's own bookings, counted as they are. */
  async getReports(principal: JwtPrincipal): Promise<AgentReportsResponse> {
    this.validator.ensureReady(this.repository.findSummary());
    const bookings = await this.bookingService.listBookings(principal);
    const generatedAt = new Date().toISOString();
    const bookingTrends = dailyRows(bookings, new Date());
    const response: AgentReportsResponse = {
      dailyBookings: makeReport(
        "AGT-RPT-DAILY",
        "Daily Bookings",
        "DAILY",
        generatedAt,
        bookingTrends,
      ),
      weeklyBookings: makeReport(
        "AGT-RPT-WEEKLY",
        "Weekly Bookings",
        "WEEKLY",
        generatedAt,
        weeklyRows(bookings, new Date()),
      ),
      monthlyBookings: makeReport(
        "AGT-RPT-MONTHLY",
        "Monthly Bookings",
        "MONTHLY",
        generatedAt,
        monthlyRows(bookings, new Date()),
      ),
      topRoutes: routeMetrics(bookings),
      topCustomers: this.customerService
        .listCustomers(principal, { pageSize: 100 })
        .customers.sort((left, right) => right.lifetimeValue.amount - left.lifetimeValue.amount)
        .slice(0, 5)
        .map((customer) => ({
          customerId: customer.customerId,
          name: customer.name,
          bookings: customer.bookingCount,
          revenue: customer.lifetimeValue,
        })),
      bookingTrends,
      revenueTrends: bookingTrends,
      cancellationTrends: bookingTrends,
      journeyDistribution: journeyDistribution(bookings),
      exports: {
        csvFileName: "agent-booking-report.csv",
        pdfFileName: "agent-booking-report.pdf",
        generatedAt,
      },
    };

    return this.mapper.toReports(response);
  }
}

function makeReport(
  reportId: string,
  name: string,
  period: AgentReportRecord["period"],
  generatedAt: string,
  rows: AgentReportPoint[],
): AgentReportRecord {
  return {
    reportId,
    name,
    period,
    status: "READY",
    generatedAt,
    rows,
  };
}

const SOLD_STATUSES = new Set(["CONFIRMED", "TICKET_GENERATED"]);
const CANCELLED_STATUSES = new Set(["CANCELLATION_REQUESTED", "CANCELLED", "REFUND_PENDING"]);
const DAY_MS = 24 * 60 * 60 * 1000;
/** India has one zone, UTC+05:30, with no daylight saving. */
const IST_OFFSET_MS = 330 * 60 * 1000;

function point(label: string, bookings: BookingRecord[]): AgentReportPoint {
  return {
    label,
    bookings: bookings.length,
    revenue: sumRevenue(bookings),
    cancellations: bookings.filter((booking) => CANCELLED_STATUSES.has(booking.status)).length,
  };
}

function createdBetween(bookings: BookingRecord[], start: number, end: number): BookingRecord[] {
  return bookings.filter((booking) => {
    const createdAt = Date.parse(booking.createdAt);

    return createdAt >= start && createdAt < end;
  });
}

/** Midnight in India for the day `now` falls on, as a UTC timestamp. */
function istDayStart(now: Date): number {
  const ist = now.getTime() + IST_OFFSET_MS;

  return ist - (ist % DAY_MS) - IST_OFFSET_MS;
}

/** The last seven days, oldest first. */
function dailyRows(bookings: BookingRecord[], now: Date): AgentReportPoint[] {
  const today = istDayStart(now);

  return Array.from({ length: 7 }, (_, index) => {
    const start = today - (6 - index) * DAY_MS;
    const label = new Date(start + IST_OFFSET_MS).toLocaleDateString("en-IN", {
      weekday: "short",
      timeZone: "UTC",
    });

    return point(label, createdBetween(bookings, start, start + DAY_MS));
  });
}

/** The last four weeks, oldest first. */
function weeklyRows(bookings: BookingRecord[], now: Date): AgentReportPoint[] {
  const end = istDayStart(now) + DAY_MS;

  return Array.from({ length: 4 }, (_, index) => {
    const weekEnd = end - (3 - index) * 7 * DAY_MS;

    return point(
      index === 3 ? "This week" : `${3 - index} wk ago`,
      createdBetween(bookings, weekEnd - 7 * DAY_MS, weekEnd),
    );
  });
}

/** The last three calendar months in India, oldest first. */
function monthlyRows(bookings: BookingRecord[], now: Date): AgentReportPoint[] {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);

  return Array.from({ length: 3 }, (_, index) => {
    const month = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth() - (2 - index), 1));
    const next = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1));

    return point(
      month.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }),
      createdBetween(bookings, month.getTime() - IST_OFFSET_MS, next.getTime() - IST_OFFSET_MS),
    );
  });
}

function routeMetrics(bookings: BookingRecord[]): AgentRouteMetric[] {
  return Object.values(
    bookings.reduce<Record<string, AgentRouteMetric>>((routes, booking) => {
      const route = `${booking.trip.sourceCity} to ${booking.trip.destinationCity}`;
      const current = routes[route] ?? {
        route,
        bookings: 0,
        revenue: { amount: 0, currency: "INR" as const },
      };
      routes[route] = {
        ...current,
        bookings: current.bookings + 1,
        revenue: {
          amount:
            current.revenue.amount +
            (SOLD_STATUSES.has(booking.status) ? booking.fare.grandTotal.amount : 0),
          currency: "INR",
        },
      };

      return routes;
    }, {}),
  ).sort((left, right) => right.bookings - left.bookings);
}

/** Bookings by the time of day the bus departs, in India. */
function journeyDistribution(bookings: BookingRecord[]): AgentReportPoint[] {
  const slots: Array<[string, number, number]> = [
    ["Morning", 6, 12],
    ["Afternoon", 12, 18],
    ["Evening", 18, 22],
    ["Night", 22, 30],
  ];

  return slots.map(([label, from, to]) =>
    point(
      label,
      bookings.filter((booking) => {
        const hour = new Date(Date.parse(booking.trip.departureTime) + IST_OFFSET_MS).getUTCHours();
        const shifted = hour < 6 ? hour + 24 : hour;

        return shifted >= from && shifted < to;
      }),
    ),
  );
}

/** Ticket value of what was actually sold. */
function sumRevenue(bookings: BookingRecord[]): number {
  return bookings
    .filter((booking) => SOLD_STATUSES.has(booking.status))
    .reduce((total, booking) => total + booking.fare.grandTotal.amount, 0);
}
