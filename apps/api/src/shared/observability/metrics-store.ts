interface RequestMetricInput {
  durationMs: number;
  statusCode: number;
}

interface MetricsSnapshot {
  requestCount: number;
  averageResponseTimeMs: number;
  errorRate: number;
}

export class ObservabilityMetricsStore {
  private static requestCount = 0;
  private static totalDurationMs = 0;
  private static errorCount = 0;

  static recordRequest(input: RequestMetricInput): void {
    this.requestCount += 1;
    this.totalDurationMs += input.durationMs;

    if (input.statusCode >= 500) {
      this.errorCount += 1;
    }
  }

  static snapshot(): MetricsSnapshot {
    return {
      requestCount: this.requestCount,
      averageResponseTimeMs:
        this.requestCount === 0 ? 0 : Math.round(this.totalDurationMs / this.requestCount),
      errorRate:
        this.requestCount === 0 ? 0 : Number((this.errorCount / this.requestCount).toFixed(4)),
    };
  }
}
