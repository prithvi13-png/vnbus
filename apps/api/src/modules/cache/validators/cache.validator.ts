import { BadRequestException, Injectable } from "@nestjs/common";
import type { CacheDashboardResponse, CacheNamespace } from "@vnbus/types";

@Injectable()
export class CacheValidator {
  ensureNamespaces(namespaces: CacheNamespace[]): void {
    if (namespaces.length === 0) {
      throw new BadRequestException("At least one cache namespace is required.");
    }
  }

  ensureDashboard(response: CacheDashboardResponse): void {
    if (response.entries.length === 0) {
      throw new BadRequestException("Cache dashboard has no entries.");
    }
  }
}
