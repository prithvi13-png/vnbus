import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { BackgroundJobRecord, SchedulerDashboardResponse } from "@vnbus/types";

@Injectable()
export class SchedulerValidator {
  /** An empty job list is a valid answer: nothing is scheduled yet. */
  ensureDashboard(response: SchedulerDashboardResponse): void {
    if (!Array.isArray(response.jobs)) {
      throw new BadRequestException("Scheduler dashboard is malformed.");
    }
  }

  ensureJob(job: BackgroundJobRecord | null): asserts job is BackgroundJobRecord {
    if (!job) {
      throw new NotFoundException("Background job was not found.");
    }
  }
}
