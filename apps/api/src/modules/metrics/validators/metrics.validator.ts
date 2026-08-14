import { BadRequestException, Injectable } from "@nestjs/common";
import type { MetricsResponse } from "@vnbus/types";

@Injectable()
export class MetricsValidator {
  ensureMetrics(response: MetricsResponse): void {
    if (response.queueStatus.length === 0) {
      throw new BadRequestException("Metrics response has no queue status.");
    }
  }
}
