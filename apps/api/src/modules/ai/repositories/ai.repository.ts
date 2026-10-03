import { Injectable } from "@nestjs/common";
import { normalizeCity } from "@vnbus/shared";
import type {
  BusSearchResult,
  RecommendationEngineResponse,
  RecommendationType,
  RecentlyViewedRouteRequest,
  TripRecommendationRecord,
} from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";
import { TripCacheService } from "../../integration/services/trip-cache.service";

const summary = {
  module: "ai",
  boundedContext: "AI recommendation boundary",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Recommendation contracts",
      description: "Prepare model-agnostic recommendation interfaces.",
    },
    {
      name: "Provider isolation",
      description: "Keep future AI providers behind explicit ports.",
    },
    {
      name: "Safety policy hooks",
      description: "Prepare governance checks before AI output reaches users.",
    },
  ],
} satisfies ModuleSummary;

/**
 * Rule-based suggestions over real search results. Only what can be read off
 * buses a supplier actually returned is suggested — the cheapest and fastest
 * on the route — and only while that search is fresh.
 */
@Injectable()
export class AiRepository {
  private readonly recentlyViewed: TripRecommendationRecord[] = [];

  constructor(private readonly tripCache: TripCacheService) {}

  findSummary(): ModuleSummary {
    return summary;
  }

  getRecommendations(
    input: {
      sourceCity?: string;
      destinationCity?: string;
    } = {},
  ): RecommendationEngineResponse {
    const generatedAt = new Date().toISOString();
    const trips =
      input.sourceCity && input.destinationCity
        ? this.tripCache.findByRoute(
            normalizeCity(input.sourceCity),
            normalizeCity(input.destinationCity),
          )
        : [];
    const cheapest = [...trips].sort((left, right) => left.fare.amount - right.fare.amount)[0];
    const fastest = [...trips].sort(
      (left, right) => left.durationMinutes - right.durationMinutes,
    )[0];
    const recommendations = [
      cheapest &&
        toRecommendation(
          "CHEAPEST_ROUTE",
          cheapest,
          "Lowest fare on this route right now.",
          generatedAt,
        ),
      fastest &&
        toRecommendation("FASTEST_ROUTE", fastest, "Shortest journey on this route.", generatedAt),
    ].filter((item): item is TripRecommendationRecord => Boolean(item));

    return {
      engine: "RULES",
      generatedAt,
      recommendations,
      recentlyViewed: this.recentlyViewed.slice(0, 5),
      trendingRoutes: [],
      architecture: {
        modelProvider: "NONE",
        futureLlmPort: "AiRecommendationProvider",
        safetyPolicy: "Rules output is deterministic. Future LLM output must pass policy hooks.",
      },
    };
  }

  recordRecentlyViewed(input: RecentlyViewedRouteRequest): RecommendationEngineResponse {
    const generatedAt = input.viewedAt ?? new Date().toISOString();
    const sourceCity = normalizeCity(input.sourceCity);
    const destinationCity = normalizeCity(input.destinationCity);

    this.recentlyViewed.unshift({
      recommendationId: `REC-RECENT-${sourceCity}-${destinationCity}-${generatedAt}`,
      type: "RECENTLY_VIEWED_ROUTE",
      title: titleFor("RECENTLY_VIEWED_ROUTE"),
      route: `${sourceCity} to ${destinationCity}`,
      sourceCity,
      destinationCity,
      reason: "Route you looked at recently.",
      confidenceScore: 1,
      fare: { amount: 0, currency: "INR" },
      durationMinutes: 0,
      operatorName: "",
      rating: 0,
      tags: [titleFor("RECENTLY_VIEWED_ROUTE")],
      generatedAt,
    });
    this.recentlyViewed.splice(20);

    return this.getRecommendations(input);
  }
}

function toRecommendation(
  type: RecommendationType,
  trip: BusSearchResult,
  reason: string,
  generatedAt: string,
): TripRecommendationRecord {
  return {
    recommendationId: `REC-${type}-${trip.tripId}`,
    type,
    title: titleFor(type),
    route: `${trip.sourceCity} to ${trip.destinationCity}`,
    sourceCity: trip.sourceCity,
    destinationCity: trip.destinationCity,
    reason,
    confidenceScore: 1,
    fare: trip.fare,
    durationMinutes: trip.durationMinutes,
    operatorName: trip.operatorName,
    rating: trip.rating,
    tags: [titleFor(type)],
    generatedAt,
  };
}

function titleFor(type: RecommendationType): string {
  const titles: Record<RecommendationType, string> = {
    CHEAPEST_ROUTE: "Cheapest Route",
    FASTEST_ROUTE: "Fastest Route",
    POPULAR_ROUTE: "Popular Route",
    BEST_RATED_OPERATOR: "Best Rated Operator",
    WEEKEND_SUGGESTION: "Weekend Suggestion",
    NEARBY_DESTINATION: "Nearby Destination",
    FREQUENTLY_BOOKED_ROUTE: "Frequently Booked Route",
    RECENTLY_VIEWED_ROUTE: "Recently Viewed Route",
    TRENDING_ROUTE: "Trending Route",
    RECENTLY_BOOKED_AGAIN: "Recently Booked Again",
  };

  return titles[type];
}
