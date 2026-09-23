import { BadRequestException, Injectable } from "@nestjs/common";
import { calculateFare } from "@vnbus/shared";
import type {
  SeatHoldResponse,
  SeatLayoutAdminConfig,
  SeatLayoutDetails,
  SeatReleaseResponse,
  UpdateSeatLayoutAdminConfigRequest,
} from "@vnbus/types";

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

  async getSeatLayout(tripId: string, journeyDate: string): Promise<SeatLayoutDetails> {
    const layout = await this.supplierManager.getSeatLayout({
      supplierCode: "MOCK",
      tripId,
      journeyDate,
    });

    return this.repository.applyLayoutConfiguration(layout);
  }

  getLayoutConfiguration(): SeatLayoutAdminConfig {
    return this.repository.getLayoutConfiguration();
  }

  updateLayoutConfiguration(input: UpdateSeatLayoutAdminConfigRequest): SeatLayoutAdminConfig {
    return this.repository.updateLayoutConfiguration(input);
  }

  async holdSeats(dto: HoldSeatsDto): Promise<SeatHoldResponse> {
    this.validator.ensureHoldRequest(dto);
    const layout = await this.getSeatLayout(dto.tripId, dto.journeyDate);
    const selectedSeats = layout.decks
      .flatMap((deck) => deck.seats)
      .filter((seat) => dto.seatNumbers.includes(seat.seatNumber));
    const unavailableSeat = selectedSeats.find(
      (seat) => seat.status !== "AVAILABLE" && seat.status !== "LADIES",
    );

    if (selectedSeats.length !== dto.seatNumbers.length) {
      throw new BadRequestException("One or more seats are not part of this layout");
    }

    if (unavailableSeat) {
      throw new BadRequestException(`Seat ${unavailableSeat.seatNumber} is not available`);
    }

    const lockKey = `seat-hold:${dto.supplierCode}:${dto.tripId}:${dto.journeyDate}:${dto.seatNumbers
      .slice()
      .sort()
      .join(",")}`;
    const idempotencyKey = lockKey;
    // The cached response must not outlive the hold it describes. The key has no
    // time component, so with the default 24h TTL a lapsed hold kept being
    // replayed for the same seats — the traveller re-picked them, got the dead
    // reservation back, and "Seat reservation expired" locked those seats out for
    // the rest of the day. Expiring with the hold lets the next attempt take a
    // fresh one.
    const hold = await this.idempotency.runWithKey(
      "seat-hold",
      idempotencyKey,
      dto,
      () =>
        this.locks.withLock(lockKey, idempotencyKey, 30_000, () =>
          this.supplierManager.holdSeats(dto),
        ),
      layout.holdDurationSeconds * 1000,
    );

    return this.repository.saveHold({
      ...hold,
      fare: calculateFare(selectedSeats),
    });
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
