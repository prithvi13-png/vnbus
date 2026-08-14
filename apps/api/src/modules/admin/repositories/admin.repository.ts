import { Injectable } from "@nestjs/common";
import { searchMockTrips } from "@vnbus/shared";
import type {
  AdminActivityRecord,
  AdminBookingListQuery,
  AdminBookingListResponse,
  AdminBookingRecord,
  AdminChartPoint,
  AdminDashboardResponse,
  AdminEmailTemplatePreviewResponse,
  AdminEmailTemplateRecord,
  AdminOperatorMetric,
  AdminRouteMetric,
  BookingRecord,
  BusPoint,
  TicketEmailResponse,
  UpdateAdminEmailTemplateRequest,
} from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

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

@Injectable()
export class AdminRepository {
  private readonly emailTemplates = new Map<string, AdminEmailTemplateRecord>(
    seedEmailTemplates().map((template) => [template.key, template]),
  );

  findSummary(): ModuleSummary {
    return summary;
  }

  getDashboard(bookings: BookingRecord[] = []): AdminDashboardResponse {
    const today = "2026-08-08";
    const activeBookings = bookings.length ? bookings : seedBookings();
    const todaysBookings = activeBookings.filter((booking) => booking.createdAt.startsWith(today));
    const cancelledBookings = activeBookings.filter((booking) => booking.status === "CANCELLED");
    const revenue = activeBookings.reduce(
      (total, booking) => total + booking.fare.grandTotal.amount,
      0,
    );

    return {
      metrics: {
        todaysBookings: todaysBookings.length || 36,
        weeklyBookings: 242,
        monthlyBookings: activeBookings.length || 1128,
        revenue: { amount: revenue || 1864000, currency: "INR" },
        users: 12408,
        travelAgents: 326,
        upcomingJourneys: 418,
        cancelledBookings: cancelledBookings.length || 19,
      },
      cards: [
        { label: "Today's Bookings", value: "36", change: "+12% vs yesterday", tone: "success" },
        { label: "Weekly Bookings", value: "242", change: "+8% week over week", tone: "success" },
        { label: "Monthly Bookings", value: "1,128", change: "+14% month lift", tone: "success" },
        { label: "Revenue", value: "INR 18.6L", change: "Mock settlement", tone: "neutral" },
        { label: "Users", value: "12,408", change: "Customer and staff", tone: "neutral" },
        { label: "Travel Agents", value: "326", change: "294 active", tone: "success" },
        { label: "Upcoming Journeys", value: "418", change: "Next 7 days", tone: "neutral" },
        { label: "Cancelled Bookings", value: "19", change: "1.7% rate", tone: "warning" },
      ],
      bookingTrends: seedChartPoints(),
      popularRoutes: seedRouteMetrics(),
      topOperators: seedOperators(),
      mostActiveCustomers: [
        {
          customerId: "CUS-001",
          name: "Aarav Sharma",
          bookings: 14,
          revenue: { amount: 22400, currency: "INR" },
          lastBookedAt: "2026-08-08T07:45:00.000Z",
        },
        {
          customerId: "CUS-002",
          name: "Meera Iyer",
          bookings: 11,
          revenue: { amount: 17600, currency: "INR" },
          lastBookedAt: "2026-08-07T14:20:00.000Z",
        },
        {
          customerId: "CUS-003",
          name: "Rohan Gupta",
          bookings: 8,
          revenue: { amount: 13200, currency: "INR" },
          lastBookedAt: "2026-08-07T09:10:00.000Z",
        },
      ],
      recentActivities: seedActivities(),
      systemHealth: [
        health("API", "HEALTHY", 42, "Core REST surface responding normally."),
        health("Database", "HEALTHY", 18, "Postgres read/write checks passing."),
        health("Redis", "DEGRADED", 96, "Queue latency above target in mock snapshot."),
        health("Storage", "HEALTHY", 25, "Ticket object storage placeholder reachable."),
        health("Email", "HEALTHY", 12, "Mock email queue is active; live provider is not enabled."),
        health("Suppliers", "HEALTHY", 8, "Mock supplier is active; live suppliers are disabled."),
        health(
          "Payments",
          "HEALTHY",
          6,
          "Mock payment provider is active; live gateway is disabled.",
        ),
      ],
      emailQueueStatus: {
        name: "Email Queue",
        queued: 28,
        sent: 1240,
        failed: 3,
        retryScheduled: 7,
      },
      notificationQueueStatus: {
        name: "Notification Queue",
        queued: 41,
        sent: 3920,
        failed: 4,
        retryScheduled: 9,
      },
    };
  }

  listBookings(
    bookings: BookingRecord[] = [],
    query: AdminBookingListQuery,
  ): AdminBookingListResponse {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const records = (bookings.length ? bookings : seedBookings()).map(toAdminBookingRecord);
    const normalized = query.search?.trim().toLowerCase();
    const filtered = records.filter((record) => {
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

  getBooking(bookings: BookingRecord[] = [], bookingId: string): AdminBookingRecord | null {
    return (
      this.listBookings(bookings, { page: 1, pageSize: 100 }).bookings.find(
        (record) =>
          record.booking.bookingId === bookingId || record.booking.bookingReference === bookingId,
      ) ?? null
    );
  }

  resendBookingEmail(bookingId: string): TicketEmailResponse {
    return {
      bookingId,
      ticketId: `TCK-${bookingId.slice(-8)}`,
      queued: true,
      emailLogId: `EML-ADM-${Date.now().toString(36).toUpperCase()}`,
      status: "QUEUED",
    };
  }

  listEmailTemplates(): AdminEmailTemplateRecord[] {
    return [...this.emailTemplates.values()];
  }

  updateEmailTemplate(
    key: string,
    input: UpdateAdminEmailTemplateRequest,
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
        { version: existing.version + 1, changedBy: "admin", changedAt: updatedAt },
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
}

function toAdminBookingRecord(booking: BookingRecord): AdminBookingRecord {
  return {
    booking,
    customerName: booking.passengers[0]
      ? `${booking.passengers[0].firstName} ${booking.passengers[0].lastName}`
      : "Traveller",
    agentName: booking.channel === "AGENT" ? "Vriddhi Nexus Partner Desk" : null,
    ticket: null,
    timelineCount: booking.status === "TICKET_GENERATED" ? 5 : 3,
  };
}

function seedBookings(): BookingRecord[] {
  const trip = searchMockTrips({
    sourceCity: "Bangalore",
    destinationCity: "Hyderabad",
    journeyDate: "2026-08-20",
    passengerCount: 1,
  }).buses[0];
  if (!trip) {
    return [];
  }

  return [
    {
      bookingId: "BKG-ADM-001",
      bookingReference: "VNB-ADM-001",
      channel: "CUSTOMER",
      agentId: null,
      customerId: "CUS-001",
      supplierCode: trip.supplierCode,
      supplierBookingId: "SUP-001",
      pnr: "PNRADM001",
      ticketNumber: "VNT-ADM-001",
      status: "TICKET_GENERATED",
      trip,
      selectedSeats: ["1A"],
      boardingPoint: withLandmark(trip.boardingPoints[0]!),
      droppingPoint: withLandmark(trip.droppingPoints[0]!),
      passengers: [
        {
          seatNumber: "1A",
          firstName: "Aarav",
          lastName: "Sharma",
          age: 34,
          gender: "MALE",
          phone: "+919876543210",
          email: "aarav.sharma@example.com",
        },
      ],
      fare: {
        baseFare: trip.fare,
        taxes: { amount: 80, currency: "INR" },
        discount: { amount: 0, currency: "INR" },
        convenienceFee: { amount: 40, currency: "INR" },
        grandTotal: { amount: trip.fare.amount + 120, currency: "INR" },
      },
      reservationId: "RSV-ADM-001",
      createdAt: "2026-08-08T07:30:00.000Z",
      expiresAt: null,
      confirmedAt: "2026-08-08T07:32:00.000Z",
      cancelledAt: null,
      emailPrepared: true,
    },
    {
      bookingId: "BKG-ADM-002",
      bookingReference: "VNB-ADM-002",
      channel: "AGENT",
      agentId: "AGT-VN-001",
      customerId: "CUS-002",
      supplierCode: trip.supplierCode,
      supplierBookingId: "SUP-002",
      pnr: "PNRADM002",
      ticketNumber: null,
      status: "PENDING_PAYMENT",
      trip,
      selectedSeats: ["1B"],
      boardingPoint: withLandmark(trip.boardingPoints[0]!),
      droppingPoint: withLandmark(trip.droppingPoints[0]!),
      passengers: [
        {
          seatNumber: "1B",
          firstName: "Meera",
          lastName: "Iyer",
          age: 29,
          gender: "FEMALE",
          phone: "+919876543211",
          email: "meera.iyer@example.com",
        },
      ],
      fare: {
        baseFare: trip.fare,
        taxes: { amount: 80, currency: "INR" },
        discount: { amount: 50, currency: "INR" },
        convenienceFee: { amount: 40, currency: "INR" },
        grandTotal: { amount: trip.fare.amount + 70, currency: "INR" },
      },
      reservationId: "RSV-ADM-002",
      createdAt: "2026-08-08T08:10:00.000Z",
      expiresAt: "2026-08-08T08:20:00.000Z",
      confirmedAt: null,
      cancelledAt: null,
      emailPrepared: false,
    },
  ];
}

function withLandmark(point: BusPoint): BookingRecord["boardingPoint"] {
  return {
    ...point,
    landmark: "Near main gate",
  };
}

function seedChartPoints(): AdminChartPoint[] {
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

function seedRouteMetrics(): AdminRouteMetric[] {
  return [
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
    {
      route: "Mumbai to Pune",
      bookings: 171,
      revenue: { amount: 153900, currency: "INR" },
      cancellationRate: 1.1,
    },
  ];
}

function seedOperators(): AdminOperatorMetric[] {
  return [
    {
      operatorId: "OP-EASTERN",
      operatorName: "Eastern Travels",
      bookings: 214,
      revenue: { amount: 342600, currency: "INR" },
      rating: 4.6,
      status: "HEALTHY",
    },
    {
      operatorId: "OP-GREENLINE",
      operatorName: "GreenLine Roadways",
      bookings: 188,
      revenue: { amount: 351560, currency: "INR" },
      rating: 4.4,
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
  ];
}

function seedActivities(): AdminActivityRecord[] {
  return [
    {
      activityId: "ADM-ACT-001",
      actor: "admin@vriddhinexus.com",
      action: "booking.resend_email",
      entityType: "booking",
      entityId: "VNB-ADM-001",
      ipAddress: "103.21.244.12",
      device: "MacBook",
      browser: "Chrome",
      occurredAt: "2026-08-08T08:55:00.000Z",
    },
    {
      activityId: "ADM-ACT-002",
      actor: "ops@vriddhinexus.com",
      action: "feature_flag.updated",
      entityType: "feature_flag",
      entityId: "enable-agent-portal",
      ipAddress: "103.21.244.13",
      device: "Windows",
      browser: "Edge",
      occurredAt: "2026-08-08T08:35:00.000Z",
    },
  ];
}

function health(
  component: string,
  status: AdminDashboardResponse["systemHealth"][number]["status"],
  latencyMs: number,
  message: string,
): AdminDashboardResponse["systemHealth"][number] {
  return {
    component,
    status,
    latencyMs,
    uptimePercentage: status === "HEALTHY" ? 99.98 : 98.7,
    message,
    sampledAt: "2026-08-08T09:00:00.000Z",
  };
}

function seedEmailTemplates(): AdminEmailTemplateRecord[] {
  return [
    emailTemplate("booking-confirmation", "Booking confirmed: {{bookingReference}}", [
      "bookingReference",
      "route",
      "travellerName",
    ]),
    emailTemplate("booking-cancelled", "Booking cancelled: {{bookingReference}}", [
      "bookingReference",
      "refundStatus",
    ]),
    emailTemplate("booking-rescheduled", "Booking rescheduled: {{bookingReference}}", [
      "bookingReference",
      "journeyDate",
    ]),
    emailTemplate("password-reset", "Reset your Vriddhi Nexus password", ["resetUrl"]),
    emailTemplate("welcome", "Welcome to Vriddhi Nexus", ["firstName"]),
    emailTemplate("verify-email", "Verify your Vriddhi Nexus email", ["verificationUrl"]),
  ];
}

function emailTemplate(
  key: string,
  subject: string,
  variables: string[],
): AdminEmailTemplateRecord {
  return {
    templateId: `TPL-${key.toUpperCase()}`,
    key,
    subject,
    htmlBody: `<p>${subject}</p><p>{{route}}</p>`,
    textBody: `${subject}\n{{route}}`,
    variables,
    isActive: true,
    version: 3,
    versionHistory: [
      { version: 3, changedBy: "admin", changedAt: "2026-08-08T08:00:00.000Z" },
      { version: 2, changedBy: "ops", changedAt: "2026-08-02T10:00:00.000Z" },
    ],
    updatedAt: "2026-08-08T08:00:00.000Z",
  };
}

function renderTemplate(template: string, variables: Record<string, string>): string {
  return Object.entries(variables).reduce(
    (output, [key, value]) => output.replaceAll(`{{${key}}}`, value),
    template,
  );
}
