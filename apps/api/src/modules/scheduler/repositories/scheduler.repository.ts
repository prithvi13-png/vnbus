import { Injectable } from "@nestjs/common";
import type { BackgroundJobRecord, SchedulerDashboardResponse } from "@vnbus/types";

/**
 * Background jobs. None is registered yet: nothing in the API schedules work
 * on a timer, so the list is empty rather than describing jobs that never run.
 */
@Injectable()
export class SchedulerRepository {
  private readonly jobs = new Map<string, BackgroundJobRecord>();

  getDashboard(): SchedulerDashboardResponse {
    const jobs = [...this.jobs.values()];

    return {
      jobs,
      schedulerQueue: {
        queue: "SCHEDULER_QUEUE",
        waiting: jobs.filter((job) => job.status === "SCHEDULED").length,
        active: jobs.filter((job) => job.status === "RUNNING").length,
        completed: jobs.filter((job) => job.status === "COMPLETED").length,
        failed: jobs.filter((job) => job.status === "FAILED").length,
        delayed: 0,
        retryScheduled: 0,
        deadLettered: 0,
        status: "HEALTHY",
      },
    };
  }

  find(jobId: string): BackgroundJobRecord | null {
    return this.jobs.get(jobId) ?? null;
  }

  markCompleted(jobId: string): BackgroundJobRecord | null {
    const job = this.find(jobId);

    if (!job) {
      return null;
    }

    const completed: BackgroundJobRecord = {
      ...job,
      status: "COMPLETED",
      lastRunAt: new Date().toISOString(),
    };
    this.jobs.set(jobId, completed);

    return completed;
  }
}
