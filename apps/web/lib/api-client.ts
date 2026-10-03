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

import { type AuthResponse, useAuthStore } from "./auth-store";

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const apiBaseUrl = configuredApiBaseUrl || getLocalApiBaseUrl();

/**
 * Calls where a 401 means the credentials sent were wrong, not that the access
 * token expired. Renewing the session would hide that answer.
 */
const SESSION_PATHS = new Set(["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"]);

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured for this deployment.");
  }

  // Booking requires a signed-in user, so every call carries the access token
  // when there is one. Read from the store rather than a hook: this runs
  // outside React. An explicit Authorization in `init` still wins.
  const accessToken = useAuthStore.getState().accessToken;
  let response = await send(apiBaseUrl, path, init, accessToken);

  // An expired access token is renewed from the refresh cookie and the request
  // sent once more with the new token. Only once: a 401 on that second attempt
  // is the API's answer and goes back to the caller like any other error.
  if (response.status === 401 && accessToken && !SESSION_PATHS.has(path)) {
    const renewedToken = await renewAccessToken(apiBaseUrl, accessToken);

    if (!renewedToken) {
      endExpiredSession();
      throw new Error("Your session has expired. Please sign in again.");
    }

    response = await send(
      apiBaseUrl,
      path,
      { ...init, headers: { ...init?.headers, Authorization: `Bearer ${renewedToken}` } },
      renewedToken,
    );
  }

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

function send(
  baseUrl: string,
  path: string,
  init: RequestInit | undefined,
  accessToken: string | null,
): Promise<Response> {
  return fetch(`${baseUrl}/api/v1${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  });
}

let pendingRenewal: Promise<string | null> | null = null;

/**
 * A fresh access token in place of `expiredToken`, or null when the API
 * refuses to renew the session.
 *
 * Every request that fails together shares one renewal. The API rotates the
 * refresh token on each use and treats a second use of the old one as theft,
 * revoking the whole session — so two parallel renewals would sign the user
 * out. The browser lock extends that to other tabs, which share the cookie.
 */
function renewAccessToken(baseUrl: string, expiredToken: string): Promise<string | null> {
  const current = useAuthStore.getState().accessToken;

  // Renewed (or signed out) while this request was in flight: nothing to do.
  if (current !== expiredToken) {
    return Promise.resolve(current);
  }

  pendingRenewal ??= withRenewalLock(() => requestRenewal(baseUrl)).finally(() => {
    pendingRenewal = null;
  });

  return pendingRenewal;
}

async function withRenewalLock(renew: () => Promise<string | null>): Promise<string | null> {
  if (typeof navigator !== "undefined" && "locks" in navigator) {
    // Resolves with what `renew` resolves with; the await unwraps the typing.
    return await navigator.locks.request("vnbus-session-renewal", renew);
  }

  return renew();
}

async function requestRenewal(baseUrl: string): Promise<string | null> {
  // The refresh token travels in its httpOnly cookie, never through script.
  const response = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  // Anything else (rate limit, outage) leaves the session as it is: the next
  // request will try again rather than signing the user out over a blip.
  if (!response.ok) {
    throw new Error(`Could not renew your session (${response.status}). Please try again.`);
  }

  const session = (await response.json()) as AuthResponse;
  useAuthStore.getState().setSession(session);

  return session.accessToken;
}

function endExpiredSession(): void {
  useAuthStore.getState().markSessionExpired();

  if (typeof window === "undefined" || window.location.pathname === "/login") {
    return;
  }

  const here = `${window.location.pathname}${window.location.search}`;
  window.location.replace(`/login?redirect=${encodeURIComponent(here)}`);
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
