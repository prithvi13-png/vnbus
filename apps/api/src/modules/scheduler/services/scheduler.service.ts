import { Injectable } from "@nestjs/common";
import type { BackgroundJobRecord, SchedulerDashboardResponse } from "@vnbus/types";

import { SchedulerRepository } from "../repositories/scheduler.repository";
import { SchedulerValidator } from "../validators/scheduler.validator";

@Injectable()
export class SchedulerService {
  constructor(
    private readonly repository: SchedulerRepository,
    private readonly validator: SchedulerValidator,
  ) {}

  getDashboard(): SchedulerDashboardResponse {
    const dashboard = this.repository.getDashboard();
    this.validator.ensureDashboard(dashboard);

    return dashboard;
  }

  run(jobId: string): BackgroundJobRecord {
    const job = this.repository.markCompleted(jobId);
    this.validator.ensureJob(job);

    return job;
  }
}
