import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { BackgroundJobRecord, SchedulerDashboardResponse } from "@vnbus/types";

@Injectable()
export class SchedulerValidator {
  ensureDashboard(response: SchedulerDashboardResponse): void {
    if (response.jobs.length === 0) {
      throw new BadRequestException("Scheduler has no background jobs.");
    }
  }

  ensureJob(job: BackgroundJobRecord | null): asserts job is BackgroundJobRecord {
    if (!job) {
      throw new NotFoundException("Background job was not found.");
    }
  }
}
