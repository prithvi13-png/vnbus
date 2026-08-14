import type {
  BusAmenity,
  BusSearchRequest,
  BusSearchResponse,
  BusSearchResult,
  BusType,
  SearchFilterMetadata,
  SearchFilterOption,
  SearchSortOption,
  SearchTimeWindow,
} from "@vnbus/types";

import {
  AMENITIES,
  BUS_TYPES,
  getMockSupplierTrips,
  getPopularRoutes,
  mockSearchDatabase,
  normalizeCity,
  POPULAR_CITIES,
} from "./mock-search-data.js";

export const SEARCH_SORT_LABELS: Record<SearchSortOption, string> = {
  PRICE_ASC: "Price Low to High",
  PRICE_DESC: "Price High to Low",
  DEPARTURE_ASC: "Departure Time",
  ARRIVAL_ASC: "Arrival Time",
  FASTEST: "Fastest",
  DURATION_ASC: "Shortest Duration",
  RATING_DESC: "Highest Rated",
  POPULARITY_DESC: "Most Popular",
};

export const TIME_WINDOW_LABELS: Record<SearchTimeWindow, string> = {
  BEFORE_6: "Before 6 AM",
  MORNING: "6 AM - 12 PM",
  AFTERNOON: "12 PM - 6 PM",
  EVENING: "After 6 PM",
};

export interface SearchDatasetSummary {
  popularCities: string[];
  popularRoutes: Array<{
    id: string;
    sourceCity: string;
    destinationCity: string;
    distanceKm: number;
    durationMinutes: number;
  }>;
  counts: {
    buses: number;
    operators: number;
    routes: number;
    boardingPoints: number;
    droppingPoints: number;
  };
}

export function searchMockTrips(request: BusSearchRequest): BusSearchResponse {
  const baseTrips = getMockSupplierTrips(request);

  return filterSortPaginateTrips(baseTrips, request);
}

export function filterSortPaginateTrips(
  trips: BusSearchResult[],
  request: BusSearchRequest,
): BusSearchResponse {
  const page = clampInt(request.page ?? 1, 1, 10_000);
  const pageSize = clampInt(request.pageSize ?? 12, 1, 50);
  const filtered = applyFilters(trips, request);
  const sorted = sortTrips(filtered, request.sortBy ?? "POPULARITY_DESC");
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const buses = sorted.slice(start, start + pageSize);

  return {
    success: true,
    totalResults: filtered.length,
    buses,
    filters: createFilterMetadata(trips),
    pagination: {
      page: safePage,
      pageSize,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
}

export function getSearchDatasetSummary(): SearchDatasetSummary {
  return {
    popularCities: [...POPULAR_CITIES],
    popularRoutes: getPopularRoutes(12).map((route) => ({
      id: route.id,
      sourceCity: route.sourceCity,
      destinationCity: route.destinationCity,
      distanceKm: route.distanceKm,
      durationMinutes: route.durationMinutes,
    })),
    counts: {
      buses: mockSearchDatabase.buses.length,
      operators: mockSearchDatabase.operators.length,
      routes: mockSearchDatabase.routes.length,
      boardingPoints: mockSearchDatabase.boardingPoints.length,
      droppingPoints: mockSearchDatabase.droppingPoints.length,
    },
  };
}

export function buildSearchRequestFromParams(params: URLSearchParams): BusSearchRequest {
  const sourceCity = params.get("from") ?? params.get("sourceCity") ?? "Bangalore";
  const destinationCity = params.get("to") ?? params.get("destinationCity") ?? "Hyderabad";
  const journeyDate = params.get("date") ?? params.get("journeyDate") ?? todayIsoDate();
  const request: BusSearchRequest = {
    sourceCity: normalizeCity(sourceCity),
    destinationCity: normalizeCity(destinationCity),
    journeyDate,
    passengerCount: parseInteger(params.get("passengers"), 1),
    page: parseInteger(params.get("page"), 1),
    pageSize: parseInteger(params.get("pageSize"), 12),
  };

  assignNumber(request, "minPrice", parseOptionalNumber(params.get("minPrice")));
  assignNumber(request, "maxPrice", parseOptionalNumber(params.get("maxPrice")));
  assignList(
    request,
    "departureWindows",
    parseList<SearchTimeWindow>(params.get("departure"), isTimeWindow),
  );
  assignList(
    request,
    "arrivalWindows",
    parseList<SearchTimeWindow>(params.get("arrival"), isTimeWindow),
  );
  assignList(request, "busTypes", parseList<BusType>(params.get("busTypes"), isBusType));
  assignList(request, "operators", parseList(params.get("operators")));
  assignList(request, "amenities", parseList<BusAmenity>(params.get("amenities"), isAmenity));
  assignBoolean(request, "ac", parseBoolean(params.get("ac")));
  assignBoolean(request, "nonAc", parseBoolean(params.get("nonAc")));
  assignBoolean(request, "sleeper", parseBoolean(params.get("sleeper")));
  assignBoolean(request, "seater", parseBoolean(params.get("seater")));
  assignNumber(request, "minAvailableSeats", parseOptionalNumber(params.get("seats")));
  assignNumber(request, "minRating", parseOptionalNumber(params.get("rating")));
  assignBoolean(request, "liveTracking", parseBoolean(params.get("liveTracking")));
  assignSort(request, parseSort(params.get("sort")));

  return request;
}

export function buildSearchParams(request: BusSearchRequest): URLSearchParams {
  const params = new URLSearchParams({
    from: request.sourceCity,
    to: request.destinationCity,
    date: request.journeyDate,
  });

  appendNumber(params, "passengers", request.passengerCount, 1);
  appendNumber(params, "minPrice", request.minPrice);
  appendNumber(params, "maxPrice", request.maxPrice);
  appendList(params, "departure", request.departureWindows);
  appendList(params, "arrival", request.arrivalWindows);
  appendList(params, "busTypes", request.busTypes);
  appendList(params, "operators", request.operators);
  appendList(params, "amenities", request.amenities);
  appendBoolean(params, "ac", request.ac);
  appendBoolean(params, "nonAc", request.nonAc);
  appendBoolean(params, "sleeper", request.sleeper);
  appendBoolean(params, "seater", request.seater);
  appendNumber(params, "seats", request.minAvailableSeats);
  appendNumber(params, "rating", request.minRating);
  appendBoolean(params, "liveTracking", request.liveTracking);
  if (request.sortBy && request.sortBy !== "POPULARITY_DESC") {
    params.set("sort", request.sortBy);
  }
  appendNumber(params, "page", request.page, 1);
  appendNumber(params, "pageSize", request.pageSize, 12);

  return params;
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function applyFilters(trips: BusSearchResult[], request: BusSearchRequest): BusSearchResult[] {
  return trips.filter((trip) => {
    if (request.minPrice !== undefined && trip.fare.amount < request.minPrice) {
      return false;
    }
    if (request.maxPrice !== undefined && trip.fare.amount > request.maxPrice) {
      return false;
    }
    if (
      request.departureWindows?.length &&
      !request.departureWindows.includes(getTimeWindow(trip.departureTime))
    ) {
      return false;
    }
    if (
      request.arrivalWindows?.length &&
      !request.arrivalWindows.includes(getTimeWindow(trip.arrivalTime))
    ) {
      return false;
    }
    if (request.busTypes?.length && !request.busTypes.includes(trip.busType as BusType)) {
      return false;
    }
    if (request.operators?.length && !request.operators.includes(trip.operatorName)) {
      return false;
    }
    if (
      request.amenities?.length &&
      !request.amenities.every((amenity) => trip.amenities.includes(amenity))
    ) {
      return false;
    }
    if (request.ac === true && trip.busType.toLowerCase().includes("non ac")) {
      return false;
    }
    if (request.nonAc === true && !trip.busType.toLowerCase().includes("non ac")) {
      return false;
    }
    if (request.sleeper === true && !trip.busType.toLowerCase().includes("sleeper")) {
      return false;
    }
    if (request.seater === true && !trip.busType.toLowerCase().includes("seater")) {
      return false;
    }
    if (
      request.minAvailableSeats !== undefined &&
      trip.availableSeats < request.minAvailableSeats
    ) {
      return false;
    }
    if (request.minRating !== undefined && trip.rating < request.minRating) {
      return false;
    }
    if (request.liveTracking === true && !trip.liveTracking) {
      return false;
    }

    return true;
  });
}

function sortTrips(trips: BusSearchResult[], sortBy: SearchSortOption): BusSearchResult[] {
  return [...trips].sort((left, right) => {
    switch (sortBy) {
      case "PRICE_ASC":
        return left.fare.amount - right.fare.amount;
      case "PRICE_DESC":
        return right.fare.amount - left.fare.amount;
      case "DEPARTURE_ASC":
        return Date.parse(left.departureTime) - Date.parse(right.departureTime);
      case "ARRIVAL_ASC":
        return Date.parse(left.arrivalTime) - Date.parse(right.arrivalTime);
      case "FASTEST":
      case "DURATION_ASC":
        return left.durationMinutes - right.durationMinutes;
      case "RATING_DESC":
        return right.rating - left.rating;
      case "POPULARITY_DESC":
        return right.popularityScore - left.popularityScore;
      default:
        return 0;
    }
  });
}

function createFilterMetadata(trips: BusSearchResult[]): SearchFilterMetadata {
  const prices = trips.map((trip) => trip.fare.amount);
  const seats = trips.map((trip) => trip.availableSeats);

  return {
    price: {
      min: Math.min(...prices, 0),
      max: Math.max(...prices, 0),
    },
    departureWindows: createWindowOptions(trips, "departureTime"),
    arrivalWindows: createWindowOptions(trips, "arrivalTime"),
    busTypes: createStaticOptions(BUS_TYPES, trips, (trip, busType) => trip.busType === busType),
    operators: createDynamicOptions(trips.map((trip) => trip.operatorName)),
    amenities: createStaticOptions(AMENITIES, trips, (trip, amenity) =>
      trip.amenities.includes(amenity),
    ),
    availableSeats: {
      min: Math.min(...seats, 0),
      max: Math.max(...seats, 0),
    },
    ratings: [4.5, 4, 3.5, 3].map((rating) => ({
      label: `${rating}+ stars`,
      value: String(rating),
      count: trips.filter((trip) => trip.rating >= rating).length,
    })),
  };
}

function createWindowOptions(
  trips: BusSearchResult[],
  key: "arrivalTime" | "departureTime",
): SearchFilterOption[] {
  return (Object.keys(TIME_WINDOW_LABELS) as SearchTimeWindow[]).map((window) => ({
    label: TIME_WINDOW_LABELS[window],
    value: window,
    count: trips.filter((trip) => getTimeWindow(trip[key]) === window).length,
  }));
}

function createStaticOptions<TValue extends string>(
  values: readonly TValue[],
  trips: BusSearchResult[],
  matches: (trip: BusSearchResult, value: TValue) => boolean,
): SearchFilterOption[] {
  return values.map((value) => ({
    label: value,
    value,
    count: trips.filter((trip) => matches(trip, value)).length,
  }));
}

function createDynamicOptions(values: string[]): SearchFilterOption[] {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([value, count]) => ({ label: value, value, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

function getTimeWindow(iso: string): SearchTimeWindow {
  const hour = new Date(iso).getUTCHours();
  if (hour < 6) {
    return "BEFORE_6";
  }
  if (hour < 12) {
    return "MORNING";
  }
  if (hour < 18) {
    return "AFTERNOON";
  }

  return "EVENING";
}

function parseSort(value: string | null): SearchSortOption | undefined {
  if (!value) {
    return undefined;
  }

  return isSort(value) ? value : undefined;
}

function isSort(value: string): value is SearchSortOption {
  return value in SEARCH_SORT_LABELS;
}

function isTimeWindow(value: string): value is SearchTimeWindow {
  return value in TIME_WINDOW_LABELS;
}

function isBusType(value: string): value is BusType {
  return (BUS_TYPES as string[]).includes(value);
}

function isAmenity(value: string): value is BusAmenity {
  return (AMENITIES as string[]).includes(value);
}

function parseList<TValue extends string>(
  value: string | null,
  guard?: (item: string) => item is TValue,
): TValue[] | undefined {
  if (!value) {
    return undefined;
  }

  const list = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const guarded = guard ? list.filter(guard) : list;

  return guarded.length ? (guarded as TValue[]) : undefined;
}

function parseBoolean(value: string | null): boolean | undefined {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }

  return undefined;
}

function parseOptionalNumber(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseInteger(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);

  return Number.isInteger(parsed) ? parsed : fallback;
}

function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function appendList(params: URLSearchParams, key: string, values: string[] | undefined): void {
  if (values?.length) {
    params.set(key, values.join(","));
  }
}

function appendBoolean(params: URLSearchParams, key: string, value: boolean | undefined): void {
  if (value !== undefined) {
    params.set(key, String(value));
  }
}

function appendNumber(
  params: URLSearchParams,
  key: string,
  value: number | undefined,
  omitWhen?: number,
): void {
  if (value !== undefined && value !== omitWhen) {
    params.set(key, String(value));
  }
}

function assignNumber<T extends keyof BusSearchRequest>(
  request: BusSearchRequest,
  key: T,
  value: number | undefined,
): void {
  if (value !== undefined) {
    (request as unknown as Record<string, unknown>)[key] = value;
  }
}

function assignBoolean<T extends keyof BusSearchRequest>(
  request: BusSearchRequest,
  key: T,
  value: boolean | undefined,
): void {
  if (value !== undefined) {
    (request as unknown as Record<string, unknown>)[key] = value;
  }
}

function assignList<TValue extends string, T extends keyof BusSearchRequest>(
  request: BusSearchRequest,
  key: T,
  value: TValue[] | undefined,
): void {
  if (value?.length) {
    (request as unknown as Record<string, unknown>)[key] = value;
  }
}

function assignSort(request: BusSearchRequest, value: SearchSortOption | undefined): void {
  if (value) {
    request.sortBy = value;
  }
}
