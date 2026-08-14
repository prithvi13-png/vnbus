import { BadRequestException, Injectable } from "@nestjs/common";
import type { EnqueueJobRequest, QueueDashboardResponse } from "@vnbus/types";

@Injectable()
export class QueueSystemValidator {
  ensureDashboard(response: QueueDashboardResponse): void {
    if (response.queues.length === 0) {
      throw new BadRequestException("Queue dashboard has no queues.");
    }
  }

  ensureJob(input: EnqueueJobRequest): void {
    if (!input.jobName.trim()) {
      throw new BadRequestException("Job name is required.");
    }
  }
}
