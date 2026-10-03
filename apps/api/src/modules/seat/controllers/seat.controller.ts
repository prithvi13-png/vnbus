import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { SeatLayoutDetails } from "@vnbus/types";
import { todayIsoDate } from "@vnbus/shared";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { SeatSummaryDto } from "../dto/seat-summary.dto";
import { SeatService } from "../services/seat.service";

@ApiTags("Seat")
@ApiBearerAuth()
@Controller()
export class SeatController {
  constructor(private readonly service: SeatService) {}

  @Public()
  @Get("seat/health")
  getHealth(): SeatSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("seat/capabilities")
  getCapabilities(): SeatSummaryDto {
    return this.service.getSummary();
  }

  @Public()
  @Get("seats/:tripId")
  @ApiOkResponse({ description: "The supplier's live seat layout for a searched trip" })
  getSeatLayout(
    @Param("tripId") tripId: string,
    @Query("date") journeyDate = todayIsoDate(),
  ): Promise<SeatLayoutDetails> {
    return this.service.getSeatLayout(tripId, journeyDate);
  }
}
