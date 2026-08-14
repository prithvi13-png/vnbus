import { Injectable } from "@nestjs/common";
import type { SeatHoldResponse, SeatLayoutDetails, SeatReleaseResponse } from "@vnbus/types";

import { DistributedLockService } from "../../integration/services/distributed-lock.service";
import { IdempotencyService } from "../../integration/services/idempotency.service";
import { SupplierManagerService } from "../../integration/services/supplier-manager.service";
import { SeatSummaryDto } from "../dto/seat-summary.dto";
import type { HoldSeatsDto, ReleaseSeatsDto } from "../dto/seat-workflow.dto";
import type { SeatModulePort } from "../interfaces/seat.interface";
import { SeatRepository } from "../repositories/seat.repository";
import { SeatModuleValidator } from "../validators/seat.validator";

@Injectable()
export class SeatService implements SeatModulePort {
  constructor(
    private readonly repository: SeatRepository,
    private readonly validator: SeatModuleValidator,
    private readonly supplierManager: SupplierManagerService,
    private readonly idempotency: IdempotencyService,
    private readonly locks: DistributedLockService,
  ) {}

  getSummary(): SeatSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new SeatSummaryDto(summary);
  }

  getSeatLayout(tripId: string, journeyDate: string): Promise<SeatLayoutDetails> {
    return this.supplierManager.getSeatLayout({
      supplierCode: "MOCK",
      tripId,
      journeyDate,
    });
  }

  async holdSeats(dto: HoldSeatsDto): Promise<SeatHoldResponse> {
    this.validator.ensureHoldRequest(dto);
    const lockKey = `seat-hold:${dto.supplierCode}:${dto.tripId}:${dto.journeyDate}:${dto.seatNumbers
      .slice()
      .sort()
      .join(",")}`;
    const idempotencyKey = lockKey;
    const hold = await this.idempotency.runWithKey("seat-hold", idempotencyKey, dto, () =>
      this.locks.withLock(lockKey, idempotencyKey, 30_000, () =>
        this.supplierManager.holdSeats(dto),
      ),
    );

    return this.repository.saveHold(hold);
  }

  async releaseSeats(dto: ReleaseSeatsDto): Promise<SeatReleaseResponse> {
    const hold = this.repository.findHold(dto.reservationId);
    this.validator.ensureReleaseRequest(dto, hold);
    this.repository.releaseHold(dto.reservationId);

    return this.supplierManager.releaseSeats(dto);
  }

  getHold(reservationId: string): SeatHoldResponse | null {
    return this.repository.findHold(reservationId);
  }
}
