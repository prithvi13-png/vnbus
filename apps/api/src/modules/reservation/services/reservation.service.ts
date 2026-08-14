import { Injectable } from "@nestjs/common";

import { ReservationSummaryDto } from "../dto/reservation-summary.dto";
import type { ReservationModulePort } from "../interfaces/reservation.interface";
import { ReservationRepository } from "../repositories/reservation.repository";
import { ReservationModuleValidator } from "../validators/reservation.validator";

@Injectable()
export class ReservationService implements ReservationModulePort {
  constructor(
    private readonly repository: ReservationRepository,
    private readonly validator: ReservationModuleValidator,
  ) {}

  getSummary(): ReservationSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new ReservationSummaryDto(summary);
  }
}
