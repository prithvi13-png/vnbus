import { CacheRepository } from "../../cache/repositories/cache.repository";
import { QueueSystemRepository } from "../../queue-system/repositories/queue-system.repository";
import { MetricsRepository } from "../repositories/metrics.repository";
import { MetricsService } from "../services/metrics.service";
import { MetricsValidator } from "../validators/metrics.validator";

describe("MetricsService", () => {
  it("returns queue, cache, and process metrics", () => {
    const service = new MetricsService(
      new MetricsRepository(new CacheRepository(), new QueueSystemRepository()),
      new MetricsValidator(),
    );
    const metrics = service.getMetrics();

    expect(metrics.queueStatus.map((queue) => queue.queue)).toContain("EMAIL_QUEUE");
    expect(metrics.cacheStatus.provider).toBe("REDIS");
    expect(metrics.memoryUsageMb).toBeGreaterThan(0);
  });

  it("renders Prometheus-compatible metrics", () => {
    const service = new MetricsService(
      new MetricsRepository(new CacheRepository(), new QueueSystemRepository()),
      new MetricsValidator(),
    );

    expect(service.getPrometheusMetrics()).toContain("vnbus_http_requests_total");
    expect(service.getPrometheusMetrics()).toContain("vnbus_queue_waiting_jobs");
  });
});
