import { Injectable } from "@nestjs/common";
import {
  filterSortPaginateTrips,
  getPopularRoutes,
  normalizeCity,
  POPULAR_CITIES,
} from "@vnbus/shared";
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
      description: "Prepare fan-out and merge contracts for future suppliers.",
    },
    {
      name: "Result filtering",
      description: "Model filters for operator, fare, timing, and amenities.",
    },
    {
      name: "Mock search engine",
      description:
        "Run route, date, filter, sort, and pagination over production-shaped mock trips.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class SearchRepository {
  private readonly recentSearches: SearchSuggestionRecord[] = [];

  findSummary(): ModuleSummary {
    return summary;
  }

  searchTrips(trips: BusSearchResult[], request: BusSearchRequest): BusSearchResponse {
    return filterSortPaginateTrips(trips, request);
  }

  getSuggestions(query = ""): SearchSuggestionRecord[] {
    const normalized = query.trim().toLowerCase();

    return suggestionSeed()
      .filter((suggestion) => !normalized || suggestion.label.toLowerCase().includes(normalized))
      .slice(0, 8);
  }

  getInsights(): SearchInsightsResponse {
    return {
      popularRoutes: suggestionSeed().slice(0, 6),
      popularCities: POPULAR_CITIES.slice(0, 8).map((city, index) => ({
        city,
        searchCount: 340 - index * 21,
      })),
      noResultSearches: [suggestion("Lucknow", "Goa", 14), suggestion("Vizag", "Jaipur", 9)],
      averageBookingTimeSeconds: 312,
      abandonedBookings: 27,
      recentSearches: this.recentSearches,
      autocompleteCache: this.getSuggestions(),
    };
  }

  recordRecentSearch(input: RecordRecentSearchRequest): SearchInsightsResponse {
    this.recentSearches.unshift(
      suggestion(normalizeCity(input.sourceCity), normalizeCity(input.destinationCity), 1),
    );

    return this.getInsights();
  }
}

function suggestionSeed(): SearchSuggestionRecord[] {
  return getPopularRoutes(10).map((route, index) =>
    suggestion(route.sourceCity, route.destinationCity, 420 - index * 28),
  );
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
