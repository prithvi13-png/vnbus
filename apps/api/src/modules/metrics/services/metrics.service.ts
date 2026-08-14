import { Injectable } from "@nestjs/common";
import type { MetricsResponse } from "@vnbus/types";

import { MetricsRepository } from "../repositories/metrics.repository";
import { MetricsValidator } from "../validators/metrics.validator";

@Injectable()
export class MetricsService {
  constructor(
    private readonly repository: MetricsRepository,
    private readonly validator: MetricsValidator,
  ) {}

  getMetrics(): MetricsResponse {
    const metrics = this.repository.getMetrics();
    this.validator.ensureMetrics(metrics);

    return metrics;
  }

  getPrometheusMetrics(): string {
    const metrics = this.getMetrics();

    return this.repository.getPrometheusMetrics(metrics);
  }
}
