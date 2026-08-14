import { Injectable } from "@nestjs/common";
import type { MetricsResponse } from "@vnbus/types";

import { ObservabilityMetricsStore } from "../../../shared/observability/metrics-store";
import { CacheRepository } from "../../cache/repositories/cache.repository";
import { QueueSystemRepository } from "../../queue-system/repositories/queue-system.repository";

@Injectable()
export class MetricsRepository {
  constructor(
    private readonly cacheRepository: CacheRepository,
    private readonly queueRepository: QueueSystemRepository,
  ) {}

  getMetrics(): MetricsResponse {
    const snapshot = ObservabilityMetricsStore.snapshot();
    const memory = process.memoryUsage();
    const cpu = process.cpuUsage();

    return {
      requestCount: snapshot.requestCount,
      apiResponseTimeMs: snapshot.averageResponseTimeMs,
      errorRate: snapshot.errorRate,
      queueStatus: this.queueRepository.getDashboard().queues,
      cacheStatus: this.cacheRepository.getDashboard(),
      memoryUsageMb: Math.round(memory.rss / 1024 / 1024),
      cpuUsagePercent: estimateCpuPercent(cpu),
      storageUsagePercent: Number(process.env.STORAGE_USAGE_PERCENT ?? 0),
      sampledAt: new Date().toISOString(),
    };
  }

  getPrometheusMetrics(metrics: MetricsResponse): string {
    const lines = [
      "# HELP vnbus_http_requests_total Total HTTP requests observed by the API process.",
      "# TYPE vnbus_http_requests_total counter",
      `vnbus_http_requests_total ${metrics.requestCount}`,
      "# HELP vnbus_http_latency_average_ms Average HTTP latency in milliseconds.",
      "# TYPE vnbus_http_latency_average_ms gauge",
      `vnbus_http_latency_average_ms ${metrics.apiResponseTimeMs}`,
      "# HELP vnbus_http_error_rate HTTP error rate from in-process observations.",
      "# TYPE vnbus_http_error_rate gauge",
      `vnbus_http_error_rate ${metrics.errorRate}`,
      "# HELP vnbus_process_memory_usage_mb Resident set size memory in MB.",
      "# TYPE vnbus_process_memory_usage_mb gauge",
      `vnbus_process_memory_usage_mb ${metrics.memoryUsageMb}`,
      "# HELP vnbus_process_cpu_usage_percent Estimated process CPU usage percent.",
      "# TYPE vnbus_process_cpu_usage_percent gauge",
      `vnbus_process_cpu_usage_percent ${metrics.cpuUsagePercent}`,
      "# HELP vnbus_storage_usage_percent Configured storage usage percent, if supplied by infrastructure.",
      "# TYPE vnbus_storage_usage_percent gauge",
      `vnbus_storage_usage_percent ${metrics.storageUsagePercent}`,
      "# HELP vnbus_queue_waiting_jobs Waiting jobs by BullMQ queue.",
      "# TYPE vnbus_queue_waiting_jobs gauge",
      ...metrics.queueStatus.map(
        (queue) => `vnbus_queue_waiting_jobs{queue="${queue.queue}"} ${queue.waiting}`,
      ),
      "# HELP vnbus_queue_failed_jobs Failed jobs by BullMQ queue.",
      "# TYPE vnbus_queue_failed_jobs gauge",
      ...metrics.queueStatus.map(
        (queue) => `vnbus_queue_failed_jobs{queue="${queue.queue}"} ${queue.failed}`,
      ),
    ];

    return `${lines.join("\n")}\n`;
  }
}

function estimateCpuPercent(cpu: NodeJS.CpuUsage): number {
  const uptimeSeconds = Math.max(process.uptime(), 1);
  const cpuMs = (cpu.user + cpu.system) / 1_000;

  return Math.min(100, Math.max(0, Number((cpuMs / uptimeSeconds / 10).toFixed(2))));
}
