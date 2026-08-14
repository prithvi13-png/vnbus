import { Injectable } from "@nestjs/common";

import { TrackingSummaryDto } from "../dto/tracking-summary.dto";
import type { TrackingModulePort } from "../interfaces/tracking.interface";
import { TrackingRepository } from "../repositories/tracking.repository";
import { TrackingModuleValidator } from "../validators/tracking.validator";

@Injectable()
export class TrackingService implements TrackingModulePort {
  constructor(
    private readonly repository: TrackingRepository,
    private readonly validator: TrackingModuleValidator,
  ) {}

  getSummary(): TrackingSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new TrackingSummaryDto(summary);
  }
}
