import { Injectable } from "@nestjs/common";
import type { CacheDashboardResponse, CacheEntryRecord, CacheNamespace } from "@vnbus/types";

@Injectable()
export class CacheRepository {
  private readonly entries = new Map<CacheNamespace, CacheEntryRecord>();

  getDashboard(): CacheDashboardResponse {
    const entries = [...this.entries.values()];
    const hitRate =
      entries.length === 0
        ? 0
        : Number(
            (
              entries.filter((entry) => entry.status === "HIT" || entry.status === "WARMED")
                .length / entries.length
            ).toFixed(2),
          );

    return {
      provider: "REDIS",
      status: entries.some((entry) => entry.status === "STALE") ? "DEGRADED" : "HEALTHY",
      hitRate,
      entries,
      warmedNamespaces: entries
        .filter((entry) => entry.status === "WARMED" || entry.status === "HIT")
        .map((entry) => entry.namespace),
      strategy: cacheStrategy(),
    };
  }

  warm(namespaces: CacheNamespace[]): CacheDashboardResponse {
    for (const namespace of namespaces) {
      const existing = this.entries.get(namespace);
      this.entries.set(namespace, {
        key: `cache:${namespace.toLowerCase()}`,
        namespace,
        status: "WARMED",
        ttlSeconds: ttlFor(namespace),
        sizeBytes: existing?.sizeBytes ?? 4096,
        lastAccessedAt: new Date().toISOString(),
      });
    }

    return this.getDashboard();
  }
}

function cacheStrategy(): CacheDashboardResponse["strategy"] {
  return [
    strategy("POPULAR_ROUTES", "refresh after booking trend snapshot"),
    strategy("SEARCH_RESULTS", "route/date/filter hash with short TTL"),
    strategy("AUTOCOMPLETE", "city/operator dictionary warm on deploy"),
    strategy("POPULAR_SEARCHES", "rolling search analytics aggregation"),
    strategy("RECENT_SEARCHES", "user/session scoped cache"),
    strategy("OPERATORS", "invalidate when supplier catalog changes"),
    strategy("BUS_TYPES", "invalidate on vehicle taxonomy update"),
    strategy("SETTINGS", "invalidate on platform setting update"),
    strategy("FEATURE_FLAGS", "invalidate on flag rollout update"),
    strategy("ANALYTICS", "refresh after analytics snapshot job"),
    strategy("DASHBOARD_WIDGETS", "refresh after admin dashboard snapshot"),
  ];
}

function strategy(
  namespace: CacheNamespace,
  invalidation: string,
): CacheDashboardResponse["strategy"][number] {
  return {
    namespace,
    ttlSeconds: ttlFor(namespace),
    invalidation,
  };
}

function ttlFor(namespace: CacheNamespace): number {
  const ttl: Record<CacheNamespace, number> = {
    POPULAR_ROUTES: 3600,
    SEARCH_RESULTS: 300,
    AUTOCOMPLETE: 1800,
    POPULAR_SEARCHES: 900,
    RECENT_SEARCHES: 600,
    OPERATORS: 7200,
    BUS_TYPES: 7200,
    SETTINGS: 1800,
    FEATURE_FLAGS: 120,
    ANALYTICS: 900,
    DASHBOARD_WIDGETS: 300,
  };

  return ttl[namespace];
}
