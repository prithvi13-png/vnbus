import { IsArray, IsIn } from "class-validator";
import type { CacheNamespace, WarmCacheRequest } from "@vnbus/types";

export const cacheNamespaces: CacheNamespace[] = [
  "POPULAR_ROUTES",
  "SEARCH_RESULTS",
  "AUTOCOMPLETE",
  "POPULAR_SEARCHES",
  "RECENT_SEARCHES",
  "OPERATORS",
  "BUS_TYPES",
  "SETTINGS",
  "FEATURE_FLAGS",
  "ANALYTICS",
  "DASHBOARD_WIDGETS",
];

export class WarmCacheDto implements WarmCacheRequest {
  @IsArray()
  @IsIn(cacheNamespaces, { each: true })
  namespaces!: CacheNamespace[];
}
