import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { SeatHoldResponse, SupplierCode } from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";
import type { HoldSeatsDto, ReleaseSeatsDto } from "../dto/seat-workflow.dto";

@Injectable()
export class SeatModuleValidator {
  ensureReady(summary: ModuleSummary): void {
    if (summary.status !== "READY_FOR_INTEGRATION") {
      throw new Error("Seat module is not ready for integration");
    }

    if (summary.capabilities.length === 0) {
      throw new Error("Seat module must expose at least one capability");
    }
  }

  ensureHoldRequest(request: HoldSeatsDto): void {
    if (!isSupplierCode(request.supplierCode)) {
      throw new BadRequestException("Unsupported supplier code");
    }
    if (new Set(request.seatNumbers).size !== request.seatNumbers.length) {
      throw new BadRequestException("Duplicate seat numbers are not allowed");
    }
  }

  ensureReleaseRequest(request: ReleaseSeatsDto, hold: SeatHoldResponse | null): void {
    if (!request.reservationId.trim()) {
      throw new BadRequestException("reservationId is required");
    }
    if (!hold) {
      throw new NotFoundException("Reservation hold not found");
    }
  }
}

function isSupplierCode(value: string): value is SupplierCode {
  return ["MOCK", "BCI", "REDBUS", "ABHIBUS", "TBO", "CUSTOM"].includes(value.trim().toUpperCase());
}
