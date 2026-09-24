import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type {
  SeatHoldResponse,
  SeatLayoutAdminConfig,
  SeatLayoutDetails,
  SeatReleaseResponse,
} from "@vnbus/types";
import { todayIsoDate } from "@vnbus/shared";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { UpdateSeatLayoutConfigDto } from "../dto/seat-layout-config.dto";
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
  @ApiOkResponse({ description: "Supplier seat layout" })
  getSeatLayout(
    @Param("tripId") tripId: string,
    @Query("date") journeyDate = todayIsoDate(),
  ): Promise<SeatLayoutDetails> {
    return this.service.getSeatLayout(tripId, journeyDate);
  }

  @Roles("ADMIN")
  @Get("seat-layout/config")
  @ApiOkResponse({ description: "Admin-controlled seat layout and fare settings" })
  getSeatLayoutConfiguration(): SeatLayoutAdminConfig {
    return this.service.getLayoutConfiguration();
  }

  @Roles("ADMIN")
  @Patch("seat-layout/config")
  @ApiOkResponse({ description: "Update seat layout and fare settings" })
  updateSeatLayoutConfiguration(@Body() dto: UpdateSeatLayoutConfigDto): SeatLayoutAdminConfig {
    return this.service.updateLayoutConfiguration(dto);
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
