import { Injectable } from "@nestjs/common";
import { filterSortPaginateTrips, normalizeCity } from "@vnbus/shared";
import type {
  BusSearchRequest,
  BusSearchResponse,
  BusSearchResult,
  RecordRecentSearchRequest,
  SearchInsightsResponse,
  SearchSuggestionRecord,
} from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "search",
  boundedContext: "Trip discovery",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Search normalization",
      description: "Normalize route, date, passenger, and supplier criteria.",
    },
    {
      name: "Supplier aggregation",
      description: "Fan out to every configured supplier and merge the results.",
    },
    {
      name: "Result filtering",
      description: "Filter by operator, fare, timing, and amenities.",
    },
    {
      name: "City lookup",
      description: "Suggest cities from the supplier's own city list.",
    },
  ],
} satisfies ModuleSummary;

const MAX_TRACKED_ROUTES = 500;

/**
 * Search activity since the API started, counted from real searches. Kept in
 * memory, so the counts reset on a restart.
 */
@Injectable()
export class SearchRepository {
  private readonly recentSearches: SearchSuggestionRecord[] = [];
  private readonly routeCounts = new Map<string, SearchSuggestionRecord>();
  private readonly noResultCounts = new Map<string, SearchSuggestionRecord>();

  findSummary(): ModuleSummary {
    return summary;
  }

  searchTrips(trips: BusSearchResult[], request: BusSearchRequest): BusSearchResponse {
    const response = filterSortPaginateTrips(trips, request);

    this.count(this.routeCounts, request.sourceCity, request.destinationCity);
    if (trips.length === 0) {
      this.count(this.noResultCounts, request.sourceCity, request.destinationCity);
    }

    return response;
  }

  /** Routes people have searched, most searched first. */
  getSuggestions(query = ""): SearchSuggestionRecord[] {
    const normalized = query.trim().toLowerCase();

    return ranked(this.routeCounts)
      .filter((suggestion) => !normalized || suggestion.label.toLowerCase().includes(normalized))
      .slice(0, 8);
  }

  getInsights(): SearchInsightsResponse {
    const cityCounts = new Map<string, number>();

    for (const route of this.routeCounts.values()) {
      for (const city of [route.sourceCity, route.destinationCity]) {
        cityCounts.set(city, (cityCounts.get(city) ?? 0) + route.searchCount);
      }
    }

    return {
      popularRoutes: ranked(this.routeCounts).slice(0, 6),
      popularCities: [...cityCounts.entries()]
        .map(([city, searchCount]) => ({ city, searchCount }))
        .sort((left, right) => right.searchCount - left.searchCount)
        .slice(0, 8),
      noResultSearches: ranked(this.noResultCounts).slice(0, 10),
      // Neither is measured yet; zero rather than an estimate.
      averageBookingTimeSeconds: 0,
      abandonedBookings: 0,
      recentSearches: this.recentSearches,
      autocompleteCache: this.getSuggestions(),
    };
  }

  recordRecentSearch(input: RecordRecentSearchRequest): SearchInsightsResponse {
    this.recentSearches.unshift(
      suggestion(normalizeCity(input.sourceCity), normalizeCity(input.destinationCity), 1),
    );
    this.recentSearches.splice(20);

    return this.getInsights();
  }

  private count(
    counts: Map<string, SearchSuggestionRecord>,
    sourceCity: string,
    destinationCity: string,
  ): void {
    const key = `${sourceCity}|${destinationCity}`.toLowerCase();
    const current = counts.get(key);

    if (!current && counts.size >= MAX_TRACKED_ROUTES) {
      return;
    }

    counts.set(key, suggestion(sourceCity, destinationCity, (current?.searchCount ?? 0) + 1));
  }
}

function ranked(counts: Map<string, SearchSuggestionRecord>): SearchSuggestionRecord[] {
  return [...counts.values()].sort((left, right) => right.searchCount - left.searchCount);
}

function suggestion(
  sourceCity: string,
  destinationCity: string,
  searchCount: number,
): SearchSuggestionRecord {
  return {
    label: `${sourceCity} to ${destinationCity}`,
    sourceCity,
    destinationCity,
    searchCount,
  };
}
