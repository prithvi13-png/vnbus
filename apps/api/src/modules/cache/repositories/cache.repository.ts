import { Injectable } from "@nestjs/common";
import type { CacheDashboardResponse, CacheEntryRecord, CacheNamespace } from "@vnbus/types";

const sampledAt = "2026-08-08T10:00:00.000Z";

@Injectable()
export class CacheRepository {
  private readonly entries = new Map<CacheNamespace, CacheEntryRecord>(
    seedEntries().map((entry) => [entry.namespace, entry]),
  );

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

function seedEntries(): CacheEntryRecord[] {
  return [
    entry("POPULAR_ROUTES", "HIT", 3600, 12_800),
    entry("SEARCH_RESULTS", "HIT", 300, 54_200),
    entry("AUTOCOMPLETE", "WARMED", 1800, 7_200),
    entry("POPULAR_SEARCHES", "HIT", 900, 6_100),
    entry("RECENT_SEARCHES", "MISS", 600, 2_400),
    entry("OPERATORS", "HIT", 7200, 18_000),
    entry("BUS_TYPES", "HIT", 7200, 1_200),
    entry("SETTINGS", "WARMED", 1800, 3_600),
    entry("FEATURE_FLAGS", "WARMED", 120, 2_100),
    entry("ANALYTICS", "STALE", 900, 24_000),
    entry("DASHBOARD_WIDGETS", "HIT", 300, 10_400),
  ];
}

function entry(
  namespace: CacheNamespace,
  status: CacheEntryRecord["status"],
  ttlSeconds: number,
  sizeBytes: number,
): CacheEntryRecord {
  return {
    key: `cache:${namespace.toLowerCase()}`,
    namespace,
    status,
    ttlSeconds,
    sizeBytes,
    lastAccessedAt: sampledAt,
  };
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
