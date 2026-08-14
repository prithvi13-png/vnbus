import { Controller, Get, Param } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { BookingTimelineEvent } from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { TimelineSummaryDto } from "../dto/timeline-summary.dto";
import { TimelineService } from "../services/timeline.service";

@ApiTags("Timeline")
@ApiBearerAuth()
@Controller()
export class TimelineController {
  constructor(private readonly service: TimelineService) {}

  @Public()
  @Get("timeline/health")
  getHealth(): TimelineSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("timeline/capabilities")
  getCapabilities(): TimelineSummaryDto {
    return this.service.getSummary();
  }

  @Public()
  @Get("bookings/:bookingId/timeline")
  @ApiOkResponse({ description: "Booking lifecycle timeline" })
  listForBooking(@Param("bookingId") bookingId: string): BookingTimelineEvent[] {
    return this.service.listForBooking(bookingId);
  }
}
