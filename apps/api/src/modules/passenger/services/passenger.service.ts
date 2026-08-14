import { Injectable } from "@nestjs/common";

import { PassengerSummaryDto } from "../dto/passenger-summary.dto";
import type { PassengerModulePort } from "../interfaces/passenger.interface";
import { PassengerRepository } from "../repositories/passenger.repository";
import { PassengerModuleValidator } from "../validators/passenger.validator";

@Injectable()
export class PassengerService implements PassengerModulePort {
  constructor(
    private readonly repository: PassengerRepository,
    private readonly validator: PassengerModuleValidator,
  ) {}

  getSummary(): PassengerSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new PassengerSummaryDto(summary);
  }
}
