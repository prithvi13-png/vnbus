import type { MetricsResponse } from "@vnbus/types";

export class MetricsEntity implements MetricsResponse {
  constructor(private readonly record: MetricsResponse) {}

  get requestCount(): number {
    return this.record.requestCount;
  }

  get apiResponseTimeMs(): number {
    return this.record.apiResponseTimeMs;
  }

  get errorRate(): number {
    return this.record.errorRate;
  }

  get queueStatus(): MetricsResponse["queueStatus"] {
    return this.record.queueStatus;
  }

  get cacheStatus(): MetricsResponse["cacheStatus"] {
    return this.record.cacheStatus;
  }

  get memoryUsageMb(): number {
    return this.record.memoryUsageMb;
  }

  get cpuUsagePercent(): number {
    return this.record.cpuUsagePercent;
  }

  get storageUsagePercent(): number {
    return this.record.storageUsagePercent;
  }

  get sampledAt(): string {
    return this.record.sampledAt;
  }
}
