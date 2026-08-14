import { Injectable } from "@nestjs/common";
import type { CacheDashboardResponse, CacheNamespace } from "@vnbus/types";

import { CacheRepository } from "../repositories/cache.repository";
import { CacheValidator } from "../validators/cache.validator";

@Injectable()
export class CacheService {
  constructor(
    private readonly repository: CacheRepository,
    private readonly validator: CacheValidator,
  ) {}

  getDashboard(): CacheDashboardResponse {
    const dashboard = this.repository.getDashboard();
    this.validator.ensureDashboard(dashboard);

    return dashboard;
  }

  warm(namespaces: CacheNamespace[]): CacheDashboardResponse {
    this.validator.ensureNamespaces(namespaces);
    const dashboard = this.repository.warm(namespaces);
    this.validator.ensureDashboard(dashboard);

    return dashboard;
  }
}
