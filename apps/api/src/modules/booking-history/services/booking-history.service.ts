import { Injectable } from "@nestjs/common";
import type { BookingHistoryResponse, BookingRecord } from "@vnbus/types";

import type { JwtPrincipal } from "../../../shared/security/interfaces/jwt-principal.interface";
import { BookingService } from "../../booking/services/booking.service";
import { BookingHistorySummaryDto } from "../dto/booking-history-summary.dto";
import type { BookingHistoryModulePort } from "../interfaces/booking-history.interface";
import { BookingHistoryRepository } from "../repositories/booking-history.repository";
import { BookingHistoryModuleValidator } from "../validators/booking-history.validator";

@Injectable()
export class BookingHistoryService implements BookingHistoryModulePort {
  constructor(
    private readonly repository: BookingHistoryRepository,
    private readonly validator: BookingHistoryModuleValidator,
    private readonly bookingService: BookingService,
  ) {}

  getSummary(): BookingHistorySummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new BookingHistorySummaryDto(summary);
  }

  getHistory(principal: JwtPrincipal): Promise<BookingHistoryResponse> {
    return this.bookingService.getHistory(principal);
  }

  listUpcoming(principal: JwtPrincipal): Promise<BookingRecord[]> {
    return this.bookingService.listUpcoming(principal);
  }

  listPast(principal: JwtPrincipal): Promise<BookingRecord[]> {
    return this.bookingService.listPast(principal);
  }

  listCancelled(principal: JwtPrincipal): Promise<BookingRecord[]> {
    return this.bookingService.listCancelled(principal);
  }
}
