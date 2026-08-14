import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { SeatHoldResponse, SeatLayoutDetails, SeatReleaseResponse } from "@vnbus/types";
import { todayIsoDate } from "@vnbus/shared";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { SeatSummaryDto } from "../dto/seat-summary.dto";
import { HoldSeatsDto, ReleaseSeatsDto } from "../dto/seat-workflow.dto";
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
  @ApiOkResponse({ description: "Mock supplier seat layout" })
  getSeatLayout(
    @Param("tripId") tripId: string,
    @Query("date") journeyDate = todayIsoDate(),
  ): Promise<SeatLayoutDetails> {
    return this.service.getSeatLayout(tripId, journeyDate);
  }

  @Public()
  @Post("seats/hold")
  @ApiOkResponse({ description: "Seat hold with ten-minute expiry" })
  holdSeats(@Body() dto: HoldSeatsDto): Promise<SeatHoldResponse> {
    return this.service.holdSeats(dto);
  }

  @Public()
  @Post("seats/release")
  @ApiOkResponse({ description: "Released seat hold" })
  releaseSeats(@Body() dto: ReleaseSeatsDto): Promise<SeatReleaseResponse> {
    return this.service.releaseSeats(dto);
  }
}
