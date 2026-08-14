import { Injectable } from "@nestjs/common";
import type {
  SupplierCode,
  SupplierHealth,
  SupplierIntegrationConfig,
  SupplierOperation,
} from "@vnbus/types";

@Injectable()
export class SupplierHealthService {
  private readonly metrics = new Map<
    SupplierCode,
    {
      failures: number;
      lastFailureAt: string | null;
      lastResponseTimeMs: number;
      lastSuccessfulRequestAt: string | null;
      successes: number;
    }
  >();

  list(configs: SupplierIntegrationConfig[]): SupplierHealth[] {
    return configs.map((config) => this.get(config.code));
  }

  get(supplierCode: SupplierCode): SupplierHealth {
    const metric = this.metrics.get(supplierCode) ?? this.emptyMetric();
    const total = metric.successes + metric.failures;
    const successRate = total ? metric.successes / total : 0;
    const failureRate = total ? metric.failures / total : 0;

    return {
      supplierCode,
      status: this.toStatus(successRate, failureRate, total),
      responseTimeMs: metric.lastResponseTimeMs,
      successRate,
      failureRate,
      lastSuccessfulRequestAt: metric.lastSuccessfulRequestAt,
      lastFailureAt: metric.lastFailureAt,
      checkedAt: new Date().toISOString(),
      message: total
        ? "Health derived from integration request outcomes."
        : "Unknown until checked.",
    };
  }

  recordSuccess(supplierCode: SupplierCode, responseTimeMs: number): void {
    const metric = this.metrics.get(supplierCode) ?? this.emptyMetric();
    metric.successes += 1;
    metric.lastSuccessfulRequestAt = new Date().toISOString();
    metric.lastResponseTimeMs = responseTimeMs;
    this.metrics.set(supplierCode, metric);
  }

  recordFailure(
    supplierCode: SupplierCode,
    _operation: SupplierOperation,
    responseTimeMs: number,
  ): void {
    const metric = this.metrics.get(supplierCode) ?? this.emptyMetric();
    metric.failures += 1;
    metric.lastFailureAt = new Date().toISOString();
    metric.lastResponseTimeMs = responseTimeMs;
    this.metrics.set(supplierCode, metric);
  }

  private toStatus(
    successRate: number,
    failureRate: number,
    total: number,
  ): SupplierHealth["status"] {
    if (!total) {
      return "UNKNOWN";
    }
    if (failureRate >= 0.8) {
      return "UNAVAILABLE";
    }
    if (failureRate > 0 || successRate < 0.95) {
      return "DEGRADED";
    }

    return "AVAILABLE";
  }

  private emptyMetric(): {
    failures: number;
    lastFailureAt: string | null;
    lastResponseTimeMs: number;
    lastSuccessfulRequestAt: string | null;
    successes: number;
  } {
    return {
      failures: 0,
      lastFailureAt: null,
      lastResponseTimeMs: 0,
      lastSuccessfulRequestAt: null,
      successes: 0,
    };
  }
}
