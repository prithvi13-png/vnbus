import { BadRequestException, Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";
import type { SearchTripsDto } from "../dto/search-trips.dto";

@Injectable()
export class SearchModuleValidator {
  ensureReady(summary: ModuleSummary): void {
    if (summary.status !== "READY_FOR_INTEGRATION") {
      throw new Error("Search module is not ready for integration");
    }

    if (summary.capabilities.length === 0) {
      throw new Error("Search module must expose at least one capability");
    }
  }

  ensureSearchRequest(request: SearchTripsDto): void {
    if (request.sourceCity.trim().toLowerCase() === request.destinationCity.trim().toLowerCase()) {
      throw new BadRequestException("sourceCity and destinationCity must be different");
    }

    const requestedDate = new Date(`${request.journeyDate}T00:00:00.000Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (Number.isNaN(requestedDate.getTime()) || requestedDate < today) {
      throw new BadRequestException("journeyDate cannot be in the past");
    }

    if (
      request.minPrice !== undefined &&
      request.maxPrice !== undefined &&
      request.minPrice > request.maxPrice
    ) {
      throw new BadRequestException("minPrice cannot be greater than maxPrice");
    }
  }
}
