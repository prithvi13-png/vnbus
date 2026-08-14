import { Injectable } from "@nestjs/common";
import type { EnqueueJobRequest, QueueDashboardResponse } from "@vnbus/types";

import { QueueSystemRepository } from "../repositories/queue-system.repository";
import { QueueSystemValidator } from "../validators/queue-system.validator";

@Injectable()
export class QueueSystemService {
  constructor(
    private readonly repository: QueueSystemRepository,
    private readonly validator: QueueSystemValidator,
  ) {}

  getDashboard(): QueueDashboardResponse {
    const dashboard = this.repository.getDashboard();
    this.validator.ensureDashboard(dashboard);

    return dashboard;
  }

  enqueue(input: EnqueueJobRequest): QueueDashboardResponse {
    this.validator.ensureJob(input);
    const dashboard = this.repository.enqueue(input);
    this.validator.ensureDashboard(dashboard);

    return dashboard;
  }
}
