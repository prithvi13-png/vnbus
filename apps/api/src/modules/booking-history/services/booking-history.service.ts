import { Injectable } from "@nestjs/common";
import type { BookingHistoryResponse, BookingRecord } from "@vnbus/types";

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

  getHistory(): BookingHistoryResponse {
    return this.bookingService.getHistory();
  }

  listUpcoming(): BookingRecord[] {
    return this.bookingService.listUpcoming();
  }

  listPast(): BookingRecord[] {
    return this.bookingService.listPast();
  }

  listCancelled(): BookingRecord[] {
    return this.bookingService.listCancelled();
  }
}
