import { BadRequestException, Injectable } from "@nestjs/common";
import type { HealthCheckResponse } from "@vnbus/types";

@Injectable()
export class HealthValidator {
  ensureComponents(response: HealthCheckResponse): void {
    if (response.components.length === 0) {
      throw new BadRequestException("Health check has no components.");
    }
  }
}
