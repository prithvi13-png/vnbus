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
  buildSearchParams,
  buildSearchRequestFromParams,
  DEFAULT_SEARCH_SORT,
  filterSortPaginateTrips,
  normalizeCity,
  SEARCH_SORT_LABELS,
  TIME_WINDOW_LABELS,
  todayIsoDate,
} from "./search/search-engine.js";
export {
  createTicketPdf,
  createTicketRecord,
  summarizeSeatFare,
  TICKET_TERMS,
  type TicketOptions,
} from "./booking/ticket.js";
