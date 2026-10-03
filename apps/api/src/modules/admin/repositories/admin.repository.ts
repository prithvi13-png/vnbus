import { Injectable } from "@nestjs/common";
import type {
  AdminActivityRecord,
  AdminBookingListQuery,
  AdminBookingListResponse,
  AdminBookingRecord,
  AdminCustomerMetric,
  AdminDashboardResponse,
  AdminEmailTemplatePreviewResponse,
  AdminEmailTemplateRecord,
  AdminMetricRecord,
  AdminQueueStatusRecord,
  AdminSystemHealthRecord,
  BookingRecord,
  HealthCheckResponse,
  UpdateAdminEmailTemplateRequest,
} from "@vnbus/types";

import {
  CANCELLED_STATUSES,
  DAY_MS,
  SOLD_STATUSES,
  dailyTrend,
  groupBy,
  istDayStart,
  popularRoutes,
  sumFares,
  topOperators,
} from "../../../shared/domain/booking-metrics";
import type { ModuleSummary } from "../../../shared/domain/module-summary";
import { EMAIL_TEMPLATES } from "../../../shared/email/email-template.service";
import { PrismaService } from "../../../shared/prisma/prisma.service";

const summary = {
  module: "admin",
  boundedContext: "Back office administration",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Operational control",
      description: "Expose administrative views over users, bookings, and settings.",
    },
    {
      name: "RBAC stewardship",
      description: "Prepare role and permission management surfaces.",
    },
    {
      name: "Platform governance",
      description: "Centralize enterprise controls for internal teams.",
    },
  ],
} satisfies ModuleSummary;

export interface DashboardSources {
  bookings: BookingRecord[];
  health: HealthCheckResponse;
  emailQueue: AdminQueueStatusRecord;
  notificationQueue: AdminQueueStatusRecord;
}

@Injectable()
export class AdminRepository {
  private readonly emailTemplates = new Map<string, AdminEmailTemplateRecord>(
    currentEmailTemplates().map((template) => [template.key, template]),
  );

  constructor(private readonly prisma: PrismaService) {}

  findSummary(): ModuleSummary {
    return summary;
  }

  /** Every figure here is counted from real records; nothing is a sample. */
  async getDashboard(sources: DashboardSources, now = new Date()): Promise<AdminDashboardResponse> {
    const { bookings } = sources;
    const sold = bookings.filter((booking) => SOLD_STATUSES.has(booking.status));
    const todayStart = istDayStart(now);
    const createdSince = (since: number): BookingRecord[] =>
      bookings.filter((booking) => Date.parse(booking.createdAt) >= since);
    const [users, travelAgents, recentActivities] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({
        where: { deletedAt: null, role: { code: "TRAVEL_AGENT" } },
      }),
      this.listRecentActivities(),
    ]);
    const metrics = {
      todaysBookings: createdSince(todayStart).length,
      weeklyBookings: createdSince(todayStart - 6 * DAY_MS).length,
      monthlyBookings: createdSince(todayStart - 29 * DAY_MS).length,
      revenue: { amount: sumFares(sold), currency: "INR" as const },
      users,
      travelAgents,
      upcomingJourneys: sold.filter(
        (booking) => Date.parse(booking.trip.departureTime) >= now.getTime(),
      ).length,
      cancelledBookings: bookings.filter((booking) => CANCELLED_STATUSES.has(booking.status))
        .length,
    };

    return {
      metrics,
      cards: metricCards(metrics),
      bookingTrends: dailyTrend(bookings, now),
      popularRoutes: popularRoutes(bookings),
      topOperators: topOperators(bookings),
      mostActiveCustomers: mostActiveCustomers(sold),
      recentActivities,
      systemHealth: sources.health.components.map((component): AdminSystemHealthRecord => ({
        component: component.component,
        status: component.status,
        latencyMs: component.latencyMs,
        // No uptime history is collected, so none is claimed.
        uptimePercentage: 0,
        message: component.message,
        sampledAt: sources.health.checkedAt,
      })),
      emailQueueStatus: sources.emailQueue,
      notificationQueueStatus: sources.notificationQueue,
    };
  }

  listBookings(bookings: BookingRecord[], query: AdminBookingListQuery): AdminBookingListResponse {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const normalized = query.search?.trim().toLowerCase();
    const filtered = bookings.map(toAdminBookingRecord).filter((record) => {
      const booking = record.booking;
      const haystack = [
        booking.bookingId,
        booking.bookingReference,
        booking.pnr,
        record.customerName,
        record.agentName,
        booking.trip.operatorName,
        booking.trip.sourceCity,
        booking.trip.destinationCity,
        booking.status,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!normalized || haystack.includes(normalized)) &&
        (!query.bookingId ||
          booking.bookingId.includes(query.bookingId) ||
          booking.bookingReference.includes(query.bookingId)) &&
        (!query.pnr || booking.pnr?.toLowerCase().includes(query.pnr.toLowerCase())) &&
        (!query.customer ||
          record.customerName.toLowerCase().includes(query.customer.toLowerCase())) &&
        (!query.agent || record.agentName?.toLowerCase().includes(query.agent.toLowerCase())) &&
        (!query.journeyDate || booking.trip.departureTime.startsWith(query.journeyDate)) &&
        (!query.operator ||
          booking.trip.operatorName.toLowerCase().includes(query.operator.toLowerCase())) &&
        (!query.source ||
          booking.trip.sourceCity.toLowerCase().includes(query.source.toLowerCase())) &&
        (!query.destination ||
          booking.trip.destinationCity.toLowerCase().includes(query.destination.toLowerCase())) &&
        (!query.status || booking.status === query.status)
      );
    });

    return {
      bookings: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
  }

  findBooking(bookings: BookingRecord[], bookingId: string): AdminBookingRecord | null {
    const booking = bookings.find(
      (candidate) => candidate.bookingId === bookingId || candidate.bookingReference === bookingId,
    );

    return booking ? toAdminBookingRecord(booking) : null;
  }

  listEmailTemplates(): AdminEmailTemplateRecord[] {
    return [...this.emailTemplates.values()];
  }

  updateEmailTemplate(
    key: string,
    input: UpdateAdminEmailTemplateRequest,
    changedBy: string,
  ): AdminEmailTemplateRecord | null {
    const existing = this.emailTemplates.get(key);
    if (!existing) {
      return null;
    }

    const updatedAt = new Date().toISOString();
    const updated: AdminEmailTemplateRecord = {
      ...existing,
      ...input,
      version: existing.version + 1,
      versionHistory: [
        { version: existing.version + 1, changedBy, changedAt: updatedAt },
        ...existing.versionHistory,
      ],
      updatedAt,
    };
    this.emailTemplates.set(key, updated);

    return updated;
  }

  previewEmailTemplate(
    key: string,
    variables: Record<string, string>,
  ): AdminEmailTemplatePreviewResponse | null {
    const template = this.emailTemplates.get(key);
    if (!template) {
      return null;
    }

    return {
      subject: renderTemplate(template.subject, variables),
      html: renderTemplate(template.htmlBody, variables),
      text: renderTemplate(template.textBody, variables),
    };
  }

  private async listRecentActivities(): Promise<AdminActivityRecord[]> {
    const rows = await this.prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { actor: { select: { email: true } } },
    });

    return rows.map((row) => ({
      activityId: row.id,
      actor: row.actor?.email ?? row.actorType.toLowerCase(),
      action: row.action,
      entityType: row.entityType ?? "",
      entityId: row.entityId,
      ipAddress: row.ipAddress ?? "",
      device: "",
      browser: row.userAgent ?? "",
      occurredAt: row.createdAt.toISOString(),
    }));
  }
}

function toAdminBookingRecord(booking: BookingRecord): AdminBookingRecord {
  const lead = booking.passengers[0];

  return {
    booking,
    customerName: lead ? `${lead.firstName} ${lead.lastName}`.trim() : "Traveller",
    agentName: booking.channel === "AGENT" ? (booking.agentId ?? "Travel agent") : null,
    ticket: null,
    timelineCount: 0,
  };
}

function metricCards(metrics: AdminDashboardResponse["metrics"]): AdminMetricRecord[] {
  const count = (value: number): string => value.toLocaleString("en-IN");

  return [
    card("Today's Bookings", count(metrics.todaysBookings), "Since midnight IST"),
    card("Weekly Bookings", count(metrics.weeklyBookings), "Last 7 days"),
    card("Monthly Bookings", count(metrics.monthlyBookings), "Last 30 days"),
    card(
      "Revenue",
      `INR ${metrics.revenue.amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
      "Ticket value of sold bookings",
    ),
    card("Users", count(metrics.users), "Registered accounts"),
    card("Travel Agents", count(metrics.travelAgents), "Agent accounts"),
    card("Upcoming Journeys", count(metrics.upcomingJourneys), "Sold, not yet departed"),
    card(
      "Cancelled Bookings",
      count(metrics.cancelledBookings),
      "Requested or completed",
      metrics.cancelledBookings > 0 ? "warning" : "neutral",
    ),
  ];
}

function card(
  label: string,
  value: string,
  change: string,
  tone: AdminMetricRecord["tone"] = "neutral",
): AdminMetricRecord {
  return { label, value, change, tone };
}

function mostActiveCustomers(sold: BookingRecord[]): AdminCustomerMetric[] {
  return groupBy(sold, (booking) => booking.passengers[0]?.email ?? booking.bookingId)
    .map(([email, group]) => {
      const lead = group[0]?.passengers[0];

      return {
        customerId: email,
        name: lead ? `${lead.firstName} ${lead.lastName}`.trim() : email,
        bookings: group.length,
        revenue: { amount: sumFares(group), currency: "INR" as const },
        lastBookedAt: group
          .map((booking) => booking.createdAt)
          .sort()
          .at(-1) as string,
      };
    })
    .sort((left, right) => right.bookings - left.bookings)
    .slice(0, 5);
}

/** The templates outgoing email really uses, as the editor's starting point. */
function currentEmailTemplates(): AdminEmailTemplateRecord[] {
  const loadedAt = new Date().toISOString();

  return Object.entries(EMAIL_TEMPLATES).map(([key, template]) => ({
    templateId: `TPL-${key.toUpperCase()}`,
    key,
    subject: template.subject,
    htmlBody: template.htmlBody,
    textBody: template.textBody,
    variables: [
      ...new Set(
        [template.subject, template.htmlBody, template.textBody].flatMap((text) =>
          [...text.matchAll(/\{\{(\w+)\}\}/gu)].map((match) => match[1] as string),
        ),
      ),
    ],
    isActive: true,
    version: 1,
    versionHistory: [],
    updatedAt: loadedAt,
  }));
}

function renderTemplate(template: string, variables: Record<string, string>): string {
  return Object.entries(variables).reduce(
    (output, [key, value]) => output.replaceAll(`{{${key}}}`, value),
    template,
  );
}
