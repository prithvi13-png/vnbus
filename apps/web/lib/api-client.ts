import type {
  AgentBookingListQuery,
  AgentBookingListResponse,
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
  BusSearchRequest,
  BusSearchResponse,
  CancelBookingRequest,
  CancelBookingResponse,
  CitySuggestion,
  CreateAgentBookingRequest,
  CreateAgentBookingResponse,
  CreateAgentCustomerRequest,
  CreateBookingRequest,
  NotificationRecord,
  SeatLayoutDetails,
  TicketEmailRequest,
  TicketEmailResponse,
  TicketPdfResponse,
  TicketRecord,
  UpdateAgentCustomerRequest,
} from "@vnbus/types";

import { useAuthStore } from "./auth-store";

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const apiBaseUrl = configuredApiBaseUrl || getLocalApiBaseUrl();

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured for this deployment.");
  }

  // Booking requires a signed-in user, so every call carries the access token
  // when there is one. Read from the store rather than a hook: this runs
  // outside React. An explicit Authorization in `init` still wins.
  const accessToken = useAuthStore.getState().accessToken;
  const response = await fetch(`${apiBaseUrl}/api/v1${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
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

function getLocalApiBaseUrl(): string | undefined {
  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  return "http://localhost:4000";
}

function withQuery(path: string, query: object): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const encoded = params.toString();

  return encoded ? `${path}?${encoded}` : path;
}

function bookingIdOf(bookingOrId: BookingRecord | string): string {
  return typeof bookingOrId === "string" ? bookingOrId : bookingOrId.bookingId;
}

export function searchBuses(request: BusSearchRequest): Promise<BusSearchResponse> {
  return apiClient<BusSearchResponse>("/search", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/** Cities the bus supplier serves, best match first. */
export function searchCities(query: string): Promise<CitySuggestion[]> {
  return apiClient<CitySuggestion[]>(withQuery("/search/cities", { q: query }));
}

export function getSeatLayout(tripId: string, journeyDate: string): Promise<SeatLayoutDetails> {
  return apiClient<SeatLayoutDetails>(
    withQuery(`/seats/${encodeURIComponent(tripId)}`, { date: journeyDate }),
  );
}

/** Books the seats with the supplier and returns the issued ticket. */
export function createBooking(request: CreateBookingRequest): Promise<BookingConfirmationResponse> {
  return apiClient<BookingConfirmationResponse>("/bookings/create", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getBooking(bookingId: string): Promise<BookingRecord> {
  return apiClient<BookingRecord>(`/bookings/${encodeURIComponent(bookingId)}`);
}

export function getBookingTimeline(bookingId: string): Promise<BookingTimelineEvent[]> {
  return apiClient<BookingTimelineEvent[]>(`/bookings/${encodeURIComponent(bookingId)}/timeline`);
}

export function getBookingHistory(): Promise<BookingHistoryResponse> {
  return apiClient<BookingHistoryResponse>("/bookings/history");
}

export function listUpcomingBookings(): Promise<BookingRecord[]> {
  return apiClient<BookingRecord[]>("/bookings/upcoming");
}

export function listPastBookings(): Promise<BookingRecord[]> {
  return apiClient<BookingRecord[]>("/bookings/past");
}

export function listCancelledBookings(): Promise<BookingRecord[]> {
  return apiClient<BookingRecord[]>("/bookings/cancelled");
}

export function cancelBooking(request: CancelBookingRequest): Promise<CancelBookingResponse> {
  return apiClient<CancelBookingResponse>("/bookings/cancel", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getTicket(bookingOrId: BookingRecord | string): Promise<TicketRecord> {
  return apiClient<TicketRecord>(`/tickets/${encodeURIComponent(bookingIdOf(bookingOrId))}`);
}

export function downloadTicketPdf(bookingOrId: BookingRecord | string): Promise<TicketPdfResponse> {
  return apiClient<TicketPdfResponse>(
    `/tickets/${encodeURIComponent(bookingIdOf(bookingOrId))}/pdf`,
  );
}

export function emailTicket(request: TicketEmailRequest): Promise<TicketEmailResponse> {
  return apiClient<TicketEmailResponse>("/tickets/email", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function listNotifications(): Promise<NotificationRecord[]> {
  return apiClient<NotificationRecord[]>("/notifications");
}

export function markNotificationRead(notificationId: string): Promise<NotificationRecord> {
  return apiClient<NotificationRecord>(
    `/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: "POST" },
  );
}

export function markAllNotificationsRead(): Promise<unknown> {
  return apiClient("/notifications/mark-all-read", { method: "POST" });
}

export function getAgentDashboard(): Promise<AgentDashboardResponse> {
  return apiClient<AgentDashboardResponse>("/agent/dashboard");
}

export function listAgentCustomers(
  query: AgentCustomerListQuery = {},
): Promise<AgentCustomerListResponse> {
  return apiClient<AgentCustomerListResponse>(withQuery("/agent/customers", query));
}

export function getAgentCustomer(customerId: string): Promise<AgentCustomerDetailsResponse> {
  return apiClient<AgentCustomerDetailsResponse>(
    `/agent/customers/${encodeURIComponent(customerId)}`,
  );
}

export function createAgentCustomer(
  request: CreateAgentCustomerRequest,
): Promise<AgentCustomerRecord> {
  return apiClient<AgentCustomerRecord>("/agent/customers", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateAgentCustomer(
  customerId: string,
  request: UpdateAgentCustomerRequest,
): Promise<AgentCustomerRecord> {
  return apiClient<AgentCustomerRecord>(`/agent/customers/${encodeURIComponent(customerId)}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export function deleteAgentCustomer(
  customerId: string,
): Promise<{ customerId: string; deleted: boolean }> {
  return apiClient<{ customerId: string; deleted: boolean }>(
    `/agent/customers/${encodeURIComponent(customerId)}`,
    { method: "DELETE" },
  );
}

export function listAgentBookings(
  query: AgentBookingListQuery = {},
): Promise<AgentBookingListResponse> {
  return apiClient<AgentBookingListResponse>(withQuery("/agent/bookings", query));
}

export function createAgentBooking(
  request: CreateAgentBookingRequest,
): Promise<CreateAgentBookingResponse> {
  return apiClient<CreateAgentBookingResponse>("/agent/bookings", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function emailAgentTicket(request: AgentEmailTicketRequest): Promise<TicketEmailResponse> {
  return apiClient<TicketEmailResponse>("/agent/bookings/email-ticket", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getAgentReports(): Promise<AgentReportsResponse> {
  return apiClient<AgentReportsResponse>("/agent/reports");
}

export function listAgentNotifications(): Promise<NotificationRecord[]> {
  return apiClient<NotificationRecord[]>("/agent/notifications");
}
