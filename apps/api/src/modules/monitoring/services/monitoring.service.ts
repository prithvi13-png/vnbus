import { Injectable } from "@nestjs/common";
import type { AdminMonitoringResponse } from "@vnbus/types";

import type { MonitoringQueryDto } from "../dto/monitoring-query.dto";
import { MonitoringRepository } from "../repositories/monitoring.repository";
import { MonitoringValidator } from "../validators/monitoring.validator";

@Injectable()
export class MonitoringService {
  constructor(
    private readonly repository: MonitoringRepository,
    private readonly validator: MonitoringValidator,
  ) {}

  getDashboard(query: MonitoringQueryDto = {}): AdminMonitoringResponse {
    const response = this.repository.getDashboard(query);
    this.validator.ensureHasComponents(response);

    return response;
  }
}
