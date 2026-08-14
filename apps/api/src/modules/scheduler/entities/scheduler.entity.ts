import type { BackgroundJobRecord, SchedulerDashboardResponse } from "@vnbus/types";

export class BackgroundJobEntity implements BackgroundJobRecord {
  constructor(private readonly record: BackgroundJobRecord) {}

  get jobId(): string {
    return this.record.jobId;
  }

  get name(): string {
    return this.record.name;
  }

  get queue(): BackgroundJobRecord["queue"] {
    return this.record.queue;
  }

  get schedule(): BackgroundJobRecord["schedule"] {
    return this.record.schedule;
  }

  get status(): BackgroundJobRecord["status"] {
    return this.record.status;
  }

  get lastRunAt(): string | null {
    return this.record.lastRunAt;
  }

  get nextRunAt(): string {
    return this.record.nextRunAt;
  }

  get description(): string {
    return this.record.description;
  }
}

export class SchedulerDashboardEntity implements SchedulerDashboardResponse {
  constructor(private readonly record: SchedulerDashboardResponse) {}

  get jobs(): SchedulerDashboardResponse["jobs"] {
    return this.record.jobs;
  }

  get schedulerQueue(): SchedulerDashboardResponse["schedulerQueue"] {
    return this.record.schedulerQueue;
  }
}
