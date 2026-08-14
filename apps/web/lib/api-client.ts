import type {
  AgentBookingListQuery,
  AgentBookingListResponse,
  AgentBookingRecord,
  AgentCustomerDetailsResponse,
  AgentCustomerListQuery,
  AgentCustomerListResponse,
  AgentCustomerRecord,
  AgentDashboardResponse,
  AgentEmailTicketRequest,
  AgentReportsResponse,
  BookingConfirmationResponse,
  BookingHistoryResponse,
  BookingRecord,
  BookingTimelineEvent,
  CancelBookingRequest,
  CancelBookingResponse,
  ConfirmBookingRequest,
  CreateBookingRequest,
  NotificationRecord,
  RescheduleBookingRequest,
  RescheduleBookingResponse,
  SeatHoldRequest,
  SeatHoldResponse,
  SeatLayoutDetails,
  SeatReleaseRequest,
  SeatReleaseResponse,
  TicketEmailRequest,
  TicketEmailResponse,
  TicketPdfResponse,
  TicketRecord,
  BusSearchRequest,
  BusSearchResponse,
  CreateAgentCustomerRequest,
  CreateAgentBookingRequest,
  CreateAgentBookingResponse,
  UpdateAgentCustomerRequest,
} from "@vnbus/types";
import {
  calculateFare,
  confirmMockBooking,
  createMockBooking,
  createMockSeatHold,
  createMockTicketPdf,
  createTicketRecord,
  getMockSeatLayout,
  releaseMockSeatHold,
  searchMockTrips,
} from "@vnbus/shared";

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
const apiBaseUrl = configuredApiBaseUrl ?? "http://localhost:4000";
const localHolds = new Map<string, SeatHoldResponse>();
const localBookings = new Map<string, BookingRecord>();
const localTickets = new Map<string, TicketRecord>();
const localTimeline: BookingTimelineEvent[] = [];
const localNotifications: NotificationRecord[] = [];
const localAgentCustomers = new Map<string, AgentCustomerRecord>(
  seedAgentCustomers().map((customer) => [customer.customerId, customer]),
);

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}/api/v1${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `API request failed with ${response.status}`;

    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) {
        message = body.message.join(", ");
      } else if (body.message) {
        message = body.message;
      }
    } catch {
      // Preserve the status fallback when the response body is not JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function searchBuses(request: BusSearchRequest): Promise<BusSearchResponse> {
  if (!configuredApiBaseUrl) {
    await new Promise((resolve) => setTimeout(resolve, 450));

    return searchMockTrips(request);
  }

  return apiClient<BusSearchResponse>("/search", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getSeatLayout(
  tripId: string,
  journeyDate: string,
): Promise<SeatLayoutDetails> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();

    return getMockSeatLayout({ tripId, journeyDate });
  }

  return apiClient<SeatLayoutDetails>(`/seats/${tripId}?date=${journeyDate}`);
}

export async function holdSeats(request: SeatHoldRequest): Promise<SeatHoldResponse> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();
    const layout = getMockSeatLayout({
      tripId: request.tripId,
      journeyDate: request.journeyDate,
      heldSeats: [...localHolds.values()].flatMap((hold) => hold.heldSeats),
    });
    const hold = createMockSeatHold(request, layout);
    localHolds.set(hold.reservationId, hold);

    return hold;
  }

  return apiClient<SeatHoldResponse>("/seats/hold", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function releaseSeats(request: SeatReleaseRequest): Promise<SeatReleaseResponse> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();
    localHolds.delete(request.reservationId);

    return releaseMockSeatHold(request);
  }

  return apiClient<SeatReleaseResponse>("/seats/release", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function createBooking(request: CreateBookingRequest): Promise<BookingRecord> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();
    const layout = getMockSeatLayout({
      tripId: request.tripId,
      journeyDate: request.journeyDate,
    });
    const hold = localHolds.get(request.reservationId) ?? createFallbackHold(request, layout);
    const booking = createMockBooking(request, layout, hold);
    localBookings.set(booking.bookingId, booking);
    appendLocalTimeline(
      booking.bookingId,
      "BOOKING_CREATED",
      "Booking created",
      "Booking created from selected seats.",
      "info",
    );
    appendLocalTimeline(
      booking.bookingId,
      "SEAT_RESERVED",
      "Seat reserved",
      `Seats ${booking.selectedSeats.join(", ")} reserved for payment.`,
      "success",
    );
    appendLocalTimeline(
      booking.bookingId,
      "PAYMENT_PENDING",
      "Payment pending",
      "Mock payment confirmation is pending.",
      "warning",
    );

    return booking;
  }

  return apiClient<BookingRecord>("/bookings/create", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function confirmBooking(
  request: ConfirmBookingRequest,
): Promise<BookingConfirmationResponse> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();
    const booking = localBookings.get(request.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    const confirmation = confirmMockBooking(request, booking);
    localBookings.set(confirmation.booking.bookingId, confirmation.booking);
    localTickets.set(confirmation.ticket.ticketId, confirmation.ticket);
    appendLocalTimeline(
      confirmation.booking.bookingId,
      "PAYMENT_CONFIRMED",
      "Payment confirmed",
      "Mock payment accepted.",
      "success",
    );
    appendLocalTimeline(
      confirmation.booking.bookingId,
      "TICKET_GENERATED",
      "Ticket generated",
      `Ticket ${confirmation.ticket.ticketNumber} is ready.`,
      "success",
    );
    appendLocalTimeline(
      confirmation.booking.bookingId,
      "EMAIL_SENT",
      "Email sent",
      "Booking confirmation email logged by the mock queue.",
      "info",
    );
    pushLocalNotification({
      type: "BOOKING_UPDATE",
      title: "Ticket generated",
      body: `Ticket ${confirmation.ticket.ticketNumber} is ready for ${confirmation.booking.bookingReference}.`,
      bookingId: confirmation.booking.bookingId,
    });

    return confirmation;
  }

  return apiClient<BookingConfirmationResponse>("/bookings/confirm", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getBooking(bookingId: string): Promise<BookingRecord> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();
    const booking = localBookings.get(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    return booking;
  }

  return apiClient<BookingRecord>(`/bookings/${bookingId}`);
}

export async function getBookingHistory(): Promise<BookingHistoryResponse> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();

    return {
      bookings: [...localBookings.values()].sort(
        (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
      ),
      timeline: [...localTimeline],
    };
  }

  return apiClient<BookingHistoryResponse>("/bookings/history");
}

export async function listUpcomingBookings(): Promise<BookingRecord[]> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();

    return [...localBookings.values()].filter(
      (booking) =>
        Date.parse(booking.trip.departureTime) >= Date.now() &&
        !["CANCELLED", "EXPIRED", "FAILED"].includes(booking.status),
    );
  }

  return apiClient<BookingRecord[]>("/bookings/upcoming");
}

export async function listPastBookings(): Promise<BookingRecord[]> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();

    return [...localBookings.values()].filter(
      (booking) => Date.parse(booking.trip.departureTime) < Date.now(),
    );
  }

  return apiClient<BookingRecord[]>("/bookings/past");
}

export async function listCancelledBookings(): Promise<BookingRecord[]> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();

    return [...localBookings.values()].filter(
      (booking) => booking.status === "CANCELLED" || booking.status === "REFUND_PENDING",
    );
  }

  return apiClient<BookingRecord[]>("/bookings/cancelled");
}

export async function cancelBooking(request: CancelBookingRequest): Promise<CancelBookingResponse> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();
    const booking = localBookings.get(request.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    if (booking.status === "CANCELLED" || booking.status === "REFUND_PENDING") {
      throw new Error("Booking is already cancelled");
    }
    const cancelledAt = new Date().toISOString();
    const cancelled: BookingRecord = {
      ...booking,
      status: "CANCELLED",
      cancelledAt,
    };
    localBookings.set(cancelled.bookingId, cancelled);
    appendLocalTimeline(
      cancelled.bookingId,
      "CANCELLATION_REQUESTED",
      "Cancellation requested",
      request.reason || "Cancellation requested from booking details.",
      "warning",
    );
    appendLocalTimeline(
      cancelled.bookingId,
      "CANCELLED",
      "Booking cancelled",
      "Mock cancellation completed.",
      "danger",
    );
    appendLocalTimeline(
      cancelled.bookingId,
      "REFUND_PENDING",
      "Refund pending",
      "Refund handoff remains a placeholder.",
      "warning",
    );
    pushLocalNotification({
      type: "CANCELLATION_UPDATE",
      title: "Booking cancelled",
      body: `${cancelled.bookingReference} was cancelled. Refund status is pending.`,
      bookingId: cancelled.bookingId,
    });

    return {
      booking: cancelled,
      timeline: localTimeline.filter((event) => event.bookingId === cancelled.bookingId),
      refundStatus: "REFUND_PENDING",
    };
  }

  return apiClient<CancelBookingResponse>("/bookings/cancel", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function rescheduleBooking(
  request: RescheduleBookingRequest,
): Promise<RescheduleBookingResponse> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();
    const booking = localBookings.get(request.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    const rescheduledAt = new Date().toISOString();
    const updated: BookingRecord = {
      ...booking,
      status: "RESCHEDULED",
      trip: {
        ...booking.trip,
        tripId: request.newTripId ?? booking.trip.tripId,
        departureTime: replaceIsoDate(booking.trip.departureTime, request.newJourneyDate),
        arrivalTime: replaceIsoDate(booking.trip.arrivalTime, request.newJourneyDate),
      },
      rescheduledAt,
      newJourneyDate: request.newJourneyDate,
    };
    localBookings.set(updated.bookingId, updated);
    appendLocalTimeline(
      updated.bookingId,
      "RESCHEDULE_REQUESTED",
      "Reschedule requested",
      "New date selected in the mock reschedule flow.",
      "info",
    );
    appendLocalTimeline(
      updated.bookingId,
      "RESCHEDULED",
      "Booking rescheduled",
      `Journey moved to ${request.newJourneyDate}.`,
      "success",
    );
    pushLocalNotification({
      type: "RESCHEDULE_UPDATE",
      title: "Booking rescheduled",
      body: `${updated.bookingReference} moved to ${request.newJourneyDate}.`,
      bookingId: updated.bookingId,
    });

    return {
      booking: updated,
      timeline: localTimeline.filter((event) => event.bookingId === updated.bookingId),
      status: "RESCHEDULED",
    };
  }

  return apiClient<RescheduleBookingResponse>("/bookings/reschedule", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getTicket(bookingOrId: BookingRecord | string): Promise<TicketRecord> {
  const bookingId = typeof bookingOrId === "string" ? bookingOrId : bookingOrId.bookingId;

  if (!configuredApiBaseUrl) {
    await waitForMockLatency();
    const existing = [...localTickets.values()].find((ticket) => ticket.bookingId === bookingId);
    if (existing) {
      return existing;
    }
    const booking = typeof bookingOrId === "string" ? localBookings.get(bookingOrId) : bookingOrId;
    if (!booking) {
      throw new Error("Booking not found");
    }
    const ticket = createTicketRecord(booking);
    localTickets.set(ticket.ticketId, ticket);

    return ticket;
  }

  return apiClient<TicketRecord>(`/tickets/${bookingId}`);
}

export async function downloadTicketPdf(
  bookingOrId: BookingRecord | string,
): Promise<TicketPdfResponse> {
  const bookingId = typeof bookingOrId === "string" ? bookingOrId : bookingOrId.bookingId;

  if (!configuredApiBaseUrl) {
    await waitForMockLatency();
    const booking = typeof bookingOrId === "string" ? localBookings.get(bookingOrId) : bookingOrId;
    if (!booking) {
      throw new Error("Booking not found");
    }
    const ticket = await getTicket(booking);
    const pdf = {
      ...createMockTicketPdf(booking),
      ticketId: ticket.ticketId,
      downloadStatus: "DOWNLOADED" as const,
      downloadedAt: new Date().toISOString(),
    };
    localTickets.set(ticket.ticketId, {
      ...ticket,
      status: "DOWNLOADED",
      lastDownloadedAt: pdf.downloadedAt,
    });
    appendLocalTimeline(
      booking.bookingId,
      "TICKET_DOWNLOADED",
      "Ticket downloaded",
      `PDF ${pdf.fileName} downloaded.`,
      "info",
    );

    return pdf;
  }

  return apiClient<TicketPdfResponse>(`/tickets/${bookingId}/pdf`);
}

export async function emailTicket(request: TicketEmailRequest): Promise<TicketEmailResponse> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();
    const ticket = await getTicket(request.bookingId);
    const logId = createLocalId("EML", `${request.bookingId}|${request.to ?? ""}`);
    appendLocalTimeline(
      request.bookingId,
      "EMAIL_SENT",
      "Ticket emailed",
      `Ticket ${ticket.ticketNumber} email logged by mock email architecture.`,
      "info",
    );
    pushLocalNotification({
      type: "EMAIL_HISTORY",
      title: "Ticket email sent",
      body: `Ticket ${ticket.ticketNumber} was emailed${request.to ? ` to ${request.to}` : ""}.`,
      bookingId: request.bookingId,
      emailLogId: logId,
    });

    return {
      bookingId: request.bookingId,
      ticketId: ticket.ticketId,
      queued: true,
      emailLogId: logId,
      status: "SENT",
    };
  }

  return apiClient<TicketEmailResponse>("/tickets/email", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function listNotifications(): Promise<NotificationRecord[]> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();

    return [...localNotifications];
  }

  return apiClient<NotificationRecord[]>("/notifications");
}

export async function markNotificationRead(notificationId: string): Promise<NotificationRecord> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();
    const notification = localNotifications.find((item) => item.id === notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }
    notification.readStatus = "READ";
    notification.readAt = new Date().toISOString();

    return notification;
  }

  return apiClient<NotificationRecord>(`/notifications/${notificationId}/read`, {
    method: "POST",
  });
}

export async function getAgentDashboard(): Promise<AgentDashboardResponse> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();
    const bookings = [...localBookings.values()].filter((booking) => booking.channel === "AGENT");
    const today = new Date().toISOString().slice(0, 10);
    const todaysBookings = bookings.filter((booking) => booking.createdAt.startsWith(today));

    return {
      profile: mockAgentProfile,
      metrics: {
        todaysBookings: todaysBookings.length || 8,
        upcomingJourneys:
          bookings.filter(
            (booking) =>
              Date.parse(booking.trip.departureTime) >= Date.now() &&
              !["CANCELLED", "FAILED", "EXPIRED"].includes(booking.status),
          ).length || 14,
        todaysRevenue: {
          amount:
            todaysBookings.reduce((total, booking) => total + booking.fare.grandTotal.amount, 0) ||
            18600,
          currency: "INR",
        },
        cancelledBookings: bookings.filter((booking) => booking.status === "CANCELLED").length || 2,
      },
      recentCustomers: [...localAgentCustomers.values()].slice(0, 5),
      recentActivity: [
        {
          id: "AGT-ACT-LOCAL-001",
          type: "BOOKING_CREATED",
          title: "Quick booking completed",
          description: "Mock ticket generated through the shared booking flow.",
          occurredAt: new Date().toISOString(),
          actor: "Agent",
        },
        {
          id: "AGT-ACT-LOCAL-002",
          type: "SYSTEM",
          title: "Mock supplier adapter healthy",
          description: "Search, seats, booking, tickets, and email are in mock mode.",
          occurredAt: "2026-08-08T07:45:00.000Z",
          actor: "System",
        },
      ],
      quickBookingRoutes: mockRouteMetrics,
      popularRoutes: mockRouteMetrics,
      bookingStatusSummary: [
        { status: "TICKET_GENERATED", count: bookings.length || 12 },
        { status: "PENDING_PAYMENT", count: 3 },
        { status: "RESCHEDULED", count: 2 },
        { status: "CANCELLED", count: 2 },
      ],
      notifications: await listAgentNotifications(),
    };
  }

  return apiClient<AgentDashboardResponse>("/agent/dashboard");
}

export async function listAgentCustomers(
  query: AgentCustomerListQuery = {},
): Promise<AgentCustomerListResponse> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const normalized = query.search?.trim().toLowerCase();
    const tag = query.tag?.trim().toLowerCase();
    const customers = [...localAgentCustomers.values()].filter((customer) => {
      const search = [customer.name, customer.email, customer.phone, ...customer.preferredRoutes]
        .join(" ")
        .toLowerCase();

      return (
        (!normalized || search.includes(normalized)) &&
        (!query.status || customer.status === query.status) &&
        (!tag || customer.tags.some((item) => item.label.toLowerCase() === tag))
      );
    });

    return {
      customers: customers.slice((page - 1) * pageSize, page * pageSize),
      total: customers.length,
      page,
      pageSize,
    };
  }

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  });

  return apiClient<AgentCustomerListResponse>(`/agent/customers?${params.toString()}`);
}

export async function getAgentCustomer(customerId: string): Promise<AgentCustomerDetailsResponse> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();
    const customer = localAgentCustomers.get(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }
    const bookingHistory = [...localBookings.values()].filter(
      (booking) =>
        booking.customerId === customer.customerId ||
        booking.passengers.some(
          (passenger) => passenger.email === customer.email || passenger.phone === customer.phone,
        ),
    );

    return {
      customer,
      bookingHistory,
      upcomingTrips: bookingHistory.filter(
        (booking) =>
          Date.parse(booking.trip.departureTime) >= Date.now() &&
          !["CANCELLED", "FAILED", "EXPIRED"].includes(booking.status),
      ),
    };
  }

  return apiClient<AgentCustomerDetailsResponse>(`/agent/customers/${customerId}`);
}

export async function createAgentCustomer(
  request: CreateAgentCustomerRequest,
): Promise<AgentCustomerRecord> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();
    if (
      [...localAgentCustomers.values()].some(
        (customer) => customer.email === request.email || customer.phone === request.phone,
      )
    ) {
      throw new Error("Duplicate customer");
    }
    const now = new Date().toISOString();
    const customer: AgentCustomerRecord = {
      customerId: createLocalId("CUS", `${request.email}|${now}`),
      name: request.name,
      email: request.email,
      phone: request.phone,
      gender: request.gender,
      dateOfBirth: request.dateOfBirth ?? null,
      emergencyContact: request.emergencyContact ?? null,
      preferredRoutes: request.preferredRoutes ?? [],
      notes: request.notes
        ? [
            {
              noteId: createLocalId("NOTE", request.notes),
              customerId: createLocalId("CUS", `${request.email}|${now}`),
              body: request.notes,
              createdBy: "agent",
              createdAt: now,
            },
          ]
        : [],
      tags: (request.tags ?? []).map((label, index) => ({
        tagId: createLocalId("TAG", `${label}|${index}`),
        customerId: createLocalId("CUS", `${request.email}|${now}`),
        label,
        color: label.toLowerCase().includes("vip") ? "blue" : "gray",
      })),
      status: request.tags?.includes("VIP") ? "VIP" : "ACTIVE",
      bookingCount: 0,
      upcomingTrips: 0,
      lifetimeValue: { amount: 0, currency: "INR" },
      lastBookedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    localAgentCustomers.set(customer.customerId, customer);

    return customer;
  }

  return apiClient<AgentCustomerRecord>("/agent/customers", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function updateAgentCustomer(
  customerId: string,
  request: UpdateAgentCustomerRequest,
): Promise<AgentCustomerRecord> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();
    const current = localAgentCustomers.get(customerId);
    if (!current) {
      throw new Error("Customer not found");
    }
    const now = new Date().toISOString();
    const updated: AgentCustomerRecord = {
      ...current,
      ...request,
      dateOfBirth: request.dateOfBirth === undefined ? current.dateOfBirth : request.dateOfBirth,
      emergencyContact:
        request.emergencyContact === undefined
          ? current.emergencyContact
          : request.emergencyContact,
      notes:
        request.notes === undefined
          ? current.notes
          : [
              ...current.notes,
              {
                noteId: createLocalId("NOTE", `${customerId}|${request.notes}|${now}`),
                customerId,
                body: request.notes,
                createdBy: "agent",
                createdAt: now,
              },
            ],
      tags:
        request.tags === undefined
          ? current.tags
          : request.tags.map((label, index) => ({
              tagId: createLocalId("TAG", `${customerId}|${label}|${index}`),
              customerId,
              label,
              color: label.toLowerCase().includes("vip") ? "blue" : "gray",
            })),
      updatedAt: now,
    };

    localAgentCustomers.set(customerId, updated);

    return updated;
  }

  return apiClient<AgentCustomerRecord>(`/agent/customers/${customerId}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export async function deleteAgentCustomer(
  customerId: string,
): Promise<{ customerId: string; deleted: boolean }> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();

    return { customerId, deleted: localAgentCustomers.delete(customerId) };
  }

  return apiClient<{ customerId: string; deleted: boolean }>(`/agent/customers/${customerId}`, {
    method: "DELETE",
  });
}

export async function listAgentBookings(
  query: AgentBookingListQuery = {},
): Promise<AgentBookingListResponse> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const bookings = [...localBookings.values()]
      .filter((booking) => booking.channel === "AGENT")
      .map((booking): AgentBookingRecord => {
        const customer = booking.customerId
          ? (localAgentCustomers.get(booking.customerId) ?? null)
          : findAgentCustomerForBooking(booking);
        const ticket =
          [...localTickets.values()].find((item) => item.bookingId === booking.bookingId) ?? null;

        return { booking, customer, ticket, channel: "AGENT" };
      })
      .filter((record) => matchesAgentBooking(record, query));

    return {
      bookings: bookings.slice((page - 1) * pageSize, page * pageSize),
      total: bookings.length,
      page,
      pageSize,
    };
  }

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  });

  return apiClient<AgentBookingListResponse>(`/agent/bookings?${params.toString()}`);
}

export async function createAgentBooking(
  request: CreateAgentBookingRequest,
): Promise<CreateAgentBookingResponse> {
  if (!configuredApiBaseUrl) {
    const customer = localAgentCustomers.get(request.customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }
    const created = await createBooking(request);
    const confirmation = await confirmBooking({
      bookingId: created.bookingId,
      paymentReference: request.paymentReference ?? "AGENT-MOCK-PAYMENT",
    });
    const booking: BookingRecord = {
      ...confirmation.booking,
      channel: "AGENT",
      agentId: mockAgentProfile.agentId,
      customerId: customer.customerId,
    };

    localBookings.set(booking.bookingId, booking);
    updateLocalCustomerMetrics(customer.customerId, booking);
    let emailLogId: string | undefined;
    if (request.emailTicket !== false) {
      const email = await emailTicket({ bookingId: booking.bookingId, to: customer.email });
      emailLogId = email.emailLogId;
    }

    return {
      booking,
      ticket: confirmation.ticket,
      customer: localAgentCustomers.get(customer.customerId) ?? customer,
      ...(emailLogId ? { emailLogId } : {}),
    };
  }

  return apiClient<CreateAgentBookingResponse>("/agent/bookings", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function emailAgentTicket(
  request: AgentEmailTicketRequest,
): Promise<TicketEmailResponse> {
  if (!configuredApiBaseUrl) {
    return emailTicket(request);
  }

  return apiClient<TicketEmailResponse>("/agent/bookings/email-ticket", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getAgentReports(): Promise<AgentReportsResponse> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();

    return mockAgentReports();
  }

  return apiClient<AgentReportsResponse>("/agent/reports");
}

export async function listAgentNotifications(): Promise<NotificationRecord[]> {
  if (!configuredApiBaseUrl) {
    await waitForMockLatency();

    return [
      ...localNotifications,
      {
        id: "AGT-NTF-001",
        type: "AGENT_JOURNEY_REMINDER",
        readStatus: "UNREAD",
        title: "Journey reminder",
        body: "Bangalore to Hyderabad passengers board at 06:00 tomorrow.",
        createdAt: "2026-08-08T08:30:00.000Z",
        readAt: null,
      },
      {
        id: "AGT-NTF-002",
        type: "AGENT_SYSTEM",
        readStatus: "READ",
        title: "Mock supplier healthy",
        body: "Search, seats, booking, tickets, and email are available in mock mode.",
        createdAt: "2026-08-08T07:45:00.000Z",
        readAt: "2026-08-08T08:00:00.000Z",
      },
    ];
  }

  return apiClient<NotificationRecord[]>("/agent/notifications");
}

function createFallbackHold(
  request: CreateBookingRequest,
  layout: SeatLayoutDetails,
): SeatHoldResponse {
  const selected = new Set(request.selectedSeats);
  const seats = layout.decks
    .flatMap((deck) => deck.seats)
    .filter((seat) => selected.has(seat.seatNumber));

  return {
    reservationId: request.reservationId,
    status: "SEAT_HELD",
    heldSeats: request.selectedSeats,
    expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
    holdDurationSeconds: 10 * 60,
    fare: calculateFare(seats),
  };
}

function waitForMockLatency(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 350));
}

function appendLocalTimeline(
  bookingId: string,
  type: BookingTimelineEvent["type"],
  title: string,
  description: string,
  tone: BookingTimelineEvent["tone"],
): BookingTimelineEvent {
  const occurredAt = new Date().toISOString();
  const event: BookingTimelineEvent = {
    id: createLocalId("TL", `${bookingId}|${type}|${occurredAt}`),
    bookingId,
    type,
    title,
    description,
    occurredAt,
    tone,
  };

  localTimeline.push(event);

  return event;
}

function pushLocalNotification(input: {
  type: NotificationRecord["type"];
  title: string;
  body: string;
  bookingId?: string;
  emailLogId?: string;
}): NotificationRecord {
  const createdAt = new Date().toISOString();
  const notification: NotificationRecord = {
    id: createLocalId("NTF", `${input.type}|${input.title}|${createdAt}`),
    type: input.type,
    readStatus: "UNREAD",
    title: input.title,
    body: input.body,
    ...(input.bookingId ? { bookingId: input.bookingId } : {}),
    ...(input.emailLogId ? { emailLogId: input.emailLogId } : {}),
    createdAt,
    readAt: null,
  };

  localNotifications.unshift(notification);

  return notification;
}

const mockAgentProfile = {
  agentId: "AGT-VN-001",
  agencyName: "Vriddhi Nexus Partner Desk",
  agencyAddress: "Koramangala, Bengaluru, Karnataka",
  contactName: "Nisha Rao",
  email: "agent.ops@vriddhinexus.example",
  phone: "+918045678899",
  logoUrl: null,
  status: "ACTIVE" as const,
  commissionRate: 4.5,
  emailPreferences: {
    bookingConfirmation: true,
    cancellation: true,
    reschedule: true,
    journeyReminder: true,
  },
  notificationPreferences: {
    inApp: true,
    email: true,
    system: true,
  },
};

const mockRouteMetrics = [
  {
    route: "Bangalore to Hyderabad",
    bookings: 42,
    revenue: { amount: 67200, currency: "INR" as const },
  },
  {
    route: "Chennai to Coimbatore",
    bookings: 31,
    revenue: { amount: 37200, currency: "INR" as const },
  },
  { route: "Pune to Goa", bookings: 24, revenue: { amount: 34800, currency: "INR" as const } },
  { route: "Mumbai to Pune", bookings: 19, revenue: { amount: 17100, currency: "INR" as const } },
];

function seedAgentCustomers(): AgentCustomerRecord[] {
  return [
    {
      customerId: "CUS-AGT-001",
      name: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      phone: "+919876543210",
      gender: "MALE",
      dateOfBirth: "1992-04-12",
      emergencyContact: "+919800000001",
      preferredRoutes: ["Bangalore to Hyderabad"],
      notes: [
        {
          noteId: "CUS-AGT-001-NOTE-001",
          customerId: "CUS-AGT-001",
          body: "Prefers lower sleeper seats and evening departures.",
          createdBy: "agent",
          createdAt: "2026-08-08T07:30:00.000Z",
        },
      ],
      tags: [
        { tagId: "CUS-AGT-001-TAG-001", customerId: "CUS-AGT-001", label: "VIP", color: "blue" },
        {
          tagId: "CUS-AGT-001-TAG-002",
          customerId: "CUS-AGT-001",
          label: "Corporate",
          color: "emerald",
        },
      ],
      status: "VIP",
      bookingCount: 4,
      upcomingTrips: 1,
      lifetimeValue: { amount: 6400, currency: "INR" },
      lastBookedAt: "2026-08-08T07:30:00.000Z",
      createdAt: "2026-07-18T10:30:00.000Z",
      updatedAt: "2026-08-08T07:30:00.000Z",
    },
    {
      customerId: "CUS-AGT-002",
      name: "Meera Iyer",
      email: "meera.iyer@example.com",
      phone: "+919876543211",
      gender: "FEMALE",
      dateOfBirth: "1988-11-02",
      emergencyContact: "+919800000002",
      preferredRoutes: ["Chennai to Coimbatore"],
      notes: [],
      tags: [
        {
          tagId: "CUS-AGT-002-TAG-001",
          customerId: "CUS-AGT-002",
          label: "Family",
          color: "violet",
        },
      ],
      status: "ACTIVE",
      bookingCount: 2,
      upcomingTrips: 1,
      lifetimeValue: { amount: 3200, currency: "INR" },
      lastBookedAt: "2026-08-06T11:20:00.000Z",
      createdAt: "2026-07-25T06:30:00.000Z",
      updatedAt: "2026-08-06T11:20:00.000Z",
    },
    {
      customerId: "CUS-AGT-003",
      name: "Rohan Gupta",
      email: "rohan.gupta@example.com",
      phone: "+919876543212",
      gender: "MALE",
      dateOfBirth: "1995-02-20",
      emergencyContact: "+919800000003",
      preferredRoutes: ["Pune to Goa"],
      notes: [],
      tags: [
        {
          tagId: "CUS-AGT-003-TAG-001",
          customerId: "CUS-AGT-003",
          label: "Student",
          color: "gray",
        },
      ],
      status: "ACTIVE",
      bookingCount: 1,
      upcomingTrips: 0,
      lifetimeValue: { amount: 1450, currency: "INR" },
      lastBookedAt: "2026-08-01T09:15:00.000Z",
      createdAt: "2026-08-01T09:15:00.000Z",
      updatedAt: "2026-08-01T09:15:00.000Z",
    },
  ];
}

function findAgentCustomerForBooking(booking: BookingRecord): AgentCustomerRecord | null {
  return (
    [...localAgentCustomers.values()].find((customer) =>
      booking.passengers.some(
        (passenger) => passenger.email === customer.email || passenger.phone === customer.phone,
      ),
    ) ?? null
  );
}

function updateLocalCustomerMetrics(customerId: string, booking: BookingRecord): void {
  const customer = localAgentCustomers.get(customerId);
  if (!customer) {
    return;
  }

  localAgentCustomers.set(customerId, {
    ...customer,
    bookingCount: customer.bookingCount + 1,
    upcomingTrips: customer.upcomingTrips + 1,
    lifetimeValue: {
      amount: customer.lifetimeValue.amount + booking.fare.grandTotal.amount,
      currency: "INR",
    },
    lastBookedAt: booking.confirmedAt ?? booking.createdAt,
    updatedAt: booking.confirmedAt ?? booking.createdAt,
  });
}

function matchesAgentBooking(record: AgentBookingRecord, query: AgentBookingListQuery): boolean {
  const booking = record.booking;
  const passenger = booking.passengers[0];
  const normalized = query.search?.trim().toLowerCase();
  const haystack = [
    booking.bookingReference,
    booking.bookingId,
    booking.trip.operatorName,
    booking.trip.sourceCity,
    booking.trip.destinationCity,
    record.customer?.name,
    passenger?.phone,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    (!normalized || haystack.includes(normalized)) &&
    (!query.status || booking.status === query.status) &&
    (!query.journeyDate || booking.trip.departureTime.startsWith(query.journeyDate)) &&
    (!query.operator ||
      booking.trip.operatorName.toLowerCase().includes(query.operator.toLowerCase())) &&
    (!query.source || booking.trip.sourceCity.toLowerCase().includes(query.source.toLowerCase())) &&
    (!query.destination ||
      booking.trip.destinationCity.toLowerCase().includes(query.destination.toLowerCase())) &&
    (!query.customerName ||
      (record.customer?.name.toLowerCase().includes(query.customerName.toLowerCase()) ?? false)) &&
    (!query.phoneNumber || (passenger?.phone.includes(query.phoneNumber) ?? false))
  );
}

function mockAgentReports(): AgentReportsResponse {
  const generatedAt = new Date().toISOString();
  const trend = [
    { label: "Mon", bookings: 18, revenue: 28800, cancellations: 1 },
    { label: "Tue", bookings: 22, revenue: 34100, cancellations: 2 },
    { label: "Wed", bookings: 19, revenue: 30400, cancellations: 1 },
    { label: "Thu", bookings: 26, revenue: 41900, cancellations: 2 },
    { label: "Fri", bookings: 31, revenue: 50600, cancellations: 1 },
    { label: "Sat", bookings: 38, revenue: 64200, cancellations: 3 },
    { label: "Sun", bookings: 24, revenue: 38900, cancellations: 1 },
  ];

  return {
    dailyBookings: {
      reportId: "AGT-RPT-DAILY",
      name: "Daily Bookings",
      period: "DAILY",
      status: "READY",
      generatedAt,
      rows: trend,
    },
    weeklyBookings: {
      reportId: "AGT-RPT-WEEKLY",
      name: "Weekly Bookings",
      period: "WEEKLY",
      status: "READY",
      generatedAt,
      rows: [
        { label: "Week 1", bookings: 64, revenue: 98200 },
        { label: "Week 2", bookings: 71, revenue: 114300 },
        { label: "Week 3", bookings: 83, revenue: 132800 },
        { label: "Week 4", bookings: 76, revenue: 120700 },
      ],
    },
    monthlyBookings: {
      reportId: "AGT-RPT-MONTHLY",
      name: "Monthly Bookings",
      period: "MONTHLY",
      status: "READY",
      generatedAt,
      rows: [
        { label: "Jun", bookings: 224, revenue: 348000 },
        { label: "Jul", bookings: 268, revenue: 421000 },
        { label: "Aug", bookings: 294, revenue: 466000 },
      ],
    },
    topRoutes: mockRouteMetrics,
    topCustomers: [...localAgentCustomers.values()].map((customer) => ({
      customerId: customer.customerId,
      name: customer.name,
      bookings: customer.bookingCount,
      revenue: customer.lifetimeValue,
    })),
    bookingTrends: trend,
    revenueTrends: trend,
    cancellationTrends: trend,
    journeyDistribution: [
      { label: "Morning", bookings: 38, revenue: 58400 },
      { label: "Afternoon", bookings: 26, revenue: 39800 },
      { label: "Evening", bookings: 54, revenue: 87200 },
      { label: "Night", bookings: 71, revenue: 113600 },
    ],
    exports: {
      csvFileName: "agent-booking-report.csv",
      pdfFileName: "agent-booking-report.pdf",
      generatedAt,
    },
  };
}

function createLocalId(prefix: string, value: string): string {
  const hash = [...value].reduce(
    (current, char) => (current * 31 + char.charCodeAt(0)) >>> 0,
    2166136261,
  );

  return `${prefix}-${hash.toString(36).toUpperCase().padStart(8, "0").slice(0, 8)}`;
}

function replaceIsoDate(value: string, newDate: string): string {
  const time = value.includes("T") ? value.slice(10) : "T00:00:00.000Z";

  return `${newDate}${time}`;
}
