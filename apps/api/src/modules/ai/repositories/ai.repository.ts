import { Injectable } from "@nestjs/common";
import { getPopularRoutes, mockSearchDatabase, normalizeCity } from "@vnbus/shared";
import type {
  RecommendationEngineResponse,
  RecommendationType,
  RecentlyViewedRouteRequest,
  TripRecommendationRecord,
} from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

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

@Injectable()
export class AiRepository {
  private readonly recentlyViewed: TripRecommendationRecord[] = [];

  findSummary(): ModuleSummary {
    return summary;
  }

  getRecommendations(
    input: {
      sourceCity?: string;
      destinationCity?: string;
    } = {},
  ): RecommendationEngineResponse {
    const sourceCity = normalizeCity(input.sourceCity ?? "Bangalore");
    const destinationCity = normalizeCity(input.destinationCity ?? "Hyderabad");
    const routeTrips = mockSearchDatabase.buses.filter(
      (trip) => trip.sourceCity === sourceCity && trip.destinationCity === destinationCity,
    );
    const fallbackTrips = routeTrips.length ? routeTrips : mockSearchDatabase.buses.slice(0, 10);
    const cheapest = [...fallbackTrips].sort(
      (left, right) => left.fare.amount - right.fare.amount,
    )[0];
    const fastest = [...fallbackTrips].sort(
      (left, right) => left.durationMinutes - right.durationMinutes,
    )[0];
    const bestRated = [...fallbackTrips].sort((left, right) => right.rating - left.rating)[0];
    const popularRoute = getPopularRoutes(1)[0] ?? {
      sourceCity,
      destinationCity,
    };
    const generatedAt = new Date().toISOString();
    const recommendations = [
      toRecommendation(
        "CHEAPEST_ROUTE",
        cheapest,
        "Lowest fare available for this route.",
        generatedAt,
      ),
      toRecommendation("FASTEST_ROUTE", fastest, "Shortest mock journey duration.", generatedAt),
      toRecommendation(
        "BEST_RATED_OPERATOR",
        bestRated,
        "Highest operator rating in the mock dataset.",
        generatedAt,
      ),
      routeRecommendation(
        "POPULAR_ROUTE",
        popularRoute.sourceCity,
        popularRoute.destinationCity,
        "Popular route by distance-weighted mock demand.",
        generatedAt,
      ),
      routeRecommendation(
        "WEEKEND_SUGGESTION",
        "Bangalore",
        "Goa",
        "Weekend-friendly leisure route suggestion.",
        generatedAt,
      ),
      routeRecommendation(
        "NEARBY_DESTINATION",
        sourceCity,
        nearbyDestination(sourceCity),
        "Nearby destination based on mock city proximity.",
        generatedAt,
      ),
      routeRecommendation(
        "FREQUENTLY_BOOKED_ROUTE",
        "Chennai",
        "Coimbatore",
        "Frequently booked corridor in mock analytics.",
        generatedAt,
      ),
      routeRecommendation(
        "TRENDING_ROUTE",
        "Pune",
        "Goa",
        "Trending route from recent mock search velocity.",
        generatedAt,
      ),
      routeRecommendation(
        "RECENTLY_BOOKED_AGAIN",
        destinationCity,
        sourceCity,
        "Return-trip recommendation from recent booking patterns.",
        generatedAt,
      ),
    ].filter(Boolean) as TripRecommendationRecord[];

    return {
      engine: "MOCK_RULES",
      generatedAt,
      recommendations,
      recentlyViewed: this.recentlyViewed.slice(0, 5),
      trendingRoutes: recommendations.filter((item) => item.type === "TRENDING_ROUTE"),
      architecture: {
        modelProvider: "NONE",
        futureLlmPort: "AiRecommendationProvider",
        safetyPolicy: "Rules output is deterministic. Future LLM output must pass policy hooks.",
      },
    };
  }

  recordRecentlyViewed(input: RecentlyViewedRouteRequest): RecommendationEngineResponse {
    const generatedAt = input.viewedAt ?? new Date().toISOString();
    this.recentlyViewed.unshift(
      routeRecommendation(
        "RECENTLY_VIEWED_ROUTE",
        normalizeCity(input.sourceCity),
        normalizeCity(input.destinationCity),
        "Recently viewed route persisted for recommendation ranking.",
        generatedAt,
      ),
    );

    return this.getRecommendations(input);
  }
}

function toRecommendation(
  type: RecommendationType,
  trip: (typeof mockSearchDatabase.buses)[number] | undefined,
  reason: string,
  generatedAt: string,
): TripRecommendationRecord | null {
  if (!trip) {
    return null;
  }

  return {
    recommendationId: `REC-${type}-${trip.routeId}`,
    type,
    title: titleFor(type),
    route: `${trip.sourceCity} to ${trip.destinationCity}`,
    sourceCity: trip.sourceCity,
    destinationCity: trip.destinationCity,
    reason,
    confidenceScore: confidenceFor(type),
    fare: trip.fare,
    durationMinutes: trip.durationMinutes,
    operatorName: trip.operatorName,
    rating: trip.rating,
    tags: tagsFor(type),
    generatedAt,
  };
}

function routeRecommendation(
  type: RecommendationType,
  sourceCity: string,
  destinationCity: string,
  reason: string,
  generatedAt: string,
): TripRecommendationRecord {
  const trip = mockSearchDatabase.buses.find(
    (item) => item.sourceCity === sourceCity && item.destinationCity === destinationCity,
  );

  return (
    toRecommendation(type, trip, reason, generatedAt) ?? {
      recommendationId: `REC-${type}-${sourceCity}-${destinationCity}`,
      type,
      title: titleFor(type),
      route: `${sourceCity} to ${destinationCity}`,
      sourceCity,
      destinationCity,
      reason,
      confidenceScore: confidenceFor(type),
      fare: { amount: 999, currency: "INR" },
      durationMinutes: 480,
      operatorName: "Vriddhi Mock Express",
      rating: 4.4,
      tags: tagsFor(type),
      generatedAt,
    }
  );
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

function confidenceFor(type: RecommendationType): number {
  return type === "RECENTLY_VIEWED_ROUTE" ? 0.72 : type === "BEST_RATED_OPERATOR" ? 0.91 : 0.84;
}

function tagsFor(type: RecommendationType): string[] {
  return [titleFor(type), "Mock Rules", "LLM Ready"];
}

function nearbyDestination(sourceCity: string): string {
  const nearby: Record<string, string> = {
    Bangalore: "Mysore",
    Chennai: "Pondicherry",
    Mumbai: "Pune",
    Delhi: "Jaipur",
    Pune: "Goa",
  };

  return nearby[sourceCity] ?? "Hyderabad";
}
