export const APP_BRAND = "Vriddhi Nexus Pvt Ltd";

export const CUSTOMER_ROLE = "CUSTOMER";
export const TRAVEL_AGENT_ROLE = "TRAVEL_AGENT";
export const ADMIN_ROLE = "ADMIN";

export type RoleCode = typeof CUSTOMER_ROLE | typeof TRAVEL_AGENT_ROLE | typeof ADMIN_ROLE;

export type Result<T, E = Error> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: E;
    };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function fail<E = Error>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function assertUnreachable(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}

export function buildReference(prefix: string, id: string | number): string {
  return `${prefix}-${String(id).padStart(8, "0")}`;
}

export {
  AMENITIES,
  BUS_TYPES,
  CITY_ALIASES,
  CITY_POINTS,
  getMockTripById,
  getMockSupplierTrips,
  getPopularRoutes,
  mockSearchDatabase,
  normalizeCity,
  POPULAR_CITIES,
  type MockOperator,
  type MockRoute,
  type MockSearchDatabase,
} from "./search/mock-search-data";
export {
  buildSearchParams,
  buildSearchRequestFromParams,
  filterSortPaginateTrips,
  getSearchDatasetSummary,
  searchMockTrips,
  SEARCH_SORT_LABELS,
  TIME_WINDOW_LABELS,
  todayIsoDate,
  type SearchDatasetSummary,
} from "./search/search-engine";
export {
  calculateFare,
  confirmMockBooking,
  createMockBooking,
  createMockSeatHold,
  createMockTicketPdf,
  createTicketRecord,
  getMockSeatLayout,
  isHoldExpired,
  prepareMockBookingEmail,
  releaseMockSeatHold,
} from "./booking/mock-booking-engine";
