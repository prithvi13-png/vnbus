import { Injectable } from "@nestjs/common";
import type { HealthCheckResponse } from "@vnbus/types";

import { HealthRepository } from "../repositories/health.repository";
import { HealthValidator } from "../validators/health.validator";

@Injectable()
export class HealthService {
  constructor(
    private readonly repository: HealthRepository,
    private readonly validator: HealthValidator,
  ) {}

  getHealth(): HealthCheckResponse {
    const response = this.repository.getHealth();
    this.validator.ensureComponents(response);

    return response;
  }

  getReady(): HealthCheckResponse {
    const response = this.repository.getReady();
    this.validator.ensureComponents(response);

    return response;
  }

  getLive(): HealthCheckResponse {
    const response = this.repository.getLive();
    this.validator.ensureComponents(response);

    return response;
  }
}
