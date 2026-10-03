import { GoneException, Injectable } from "@nestjs/common";
import type {
  BoardingDroppingPoint,
  BusPoint,
  BusSearchResult,
  SeatLayoutDetails,
  SupplierCode,
} from "@vnbus/types";

import { SupplierManagerService } from "../../integration/services/supplier-manager.service";
import { toSupplierHttpException } from "../../integration/supplier-http-errors";
import { SeatSummaryDto } from "../dto/seat-summary.dto";
import type { SeatModulePort } from "../interfaces/seat.interface";
import { SeatRepository } from "../repositories/seat.repository";
import { SeatModuleValidator } from "../validators/seat.validator";

export const TRIP_EXPIRED_MESSAGE =
  "This bus is no longer available to book from that search. Search again to see current seats.";

@Injectable()
export class SeatService implements SeatModulePort {
  constructor(
    private readonly repository: SeatRepository,
    private readonly validator: SeatModuleValidator,
    private readonly supplierManager: SupplierManagerService,
  ) {}

  getSummary(): SeatSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new SeatSummaryDto(summary);
  }

  /**
   * The trip a recent search returned. Seat maps and bookings both need it:
   * the supplier's seat-map call describes seats only, and taking the trip
   * from our own search rather than the browser keeps fares and times honest.
   */
  getSearchedTrip(tripId: string): BusSearchResult {
    const trip = this.supplierManager.findSearchedTrip(tripId);

    if (!trip) {
      throw new GoneException(TRIP_EXPIRED_MESSAGE);
    }

    return trip;
  }

  /**
   * The supplier's live seat map, completed with the journey details from the
   * search: operator, times, cities and boarding/dropping points.
   */
  async getSeatLayout(tripId: string, journeyDate: string): Promise<SeatLayoutDetails> {
    const trip = this.getSearchedTrip(tripId);
    let layout: SeatLayoutDetails;

    try {
      layout = await this.supplierManager.getSeatLayout({
        supplierCode: trip.supplierCode as SupplierCode,
        tripId,
        journeyDate,
      });
    } catch (error) {
      throw toSupplierHttpException(error);
    }

    return {
      ...layout,
      operatorName: trip.operatorName,
      busType: trip.busType,
      sourceCity: trip.sourceCity,
      destinationCity: trip.destinationCity,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      durationMinutes: trip.durationMinutes,
      routePreview: trip.routePreview,
      boardingPoints: trip.boardingPoints.map(toBoardingDroppingPoint),
      droppingPoints: trip.droppingPoints.map(toBoardingDroppingPoint),
    };
  }
}

/** Search points carry no landmark; the address stands in for it on screen. */
function toBoardingDroppingPoint(point: BusPoint): BoardingDroppingPoint {
  return { ...point, landmark: "" };
}
