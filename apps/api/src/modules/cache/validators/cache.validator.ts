import { BadRequestException, Injectable } from "@nestjs/common";
import type { CacheDashboardResponse, CacheNamespace } from "@vnbus/types";

@Injectable()
export class CacheValidator {
  ensureNamespaces(namespaces: CacheNamespace[]): void {
    if (namespaces.length === 0) {
      throw new BadRequestException("At least one cache namespace is required.");
    }
  }

  /** No entries is a valid answer: nothing has been cached yet. */
  ensureDashboard(response: CacheDashboardResponse): void {
    if (!Array.isArray(response.entries)) {
      throw new BadRequestException("Cache dashboard is malformed.");
    }
  }
}
