import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { BookingHistorySummaryDto } from "../dto/booking-history-summary.dto";
import { BookingHistoryService } from "../services/booking-history.service";

@ApiTags("Booking History")
@ApiBearerAuth()
@Controller("booking-history")
export class BookingHistoryController {
  constructor(private readonly service: BookingHistoryService) {}

  @Public()
  @Get("health")
  getHealth(): BookingHistorySummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("capabilities")
  getCapabilities(): BookingHistorySummaryDto {
    return this.service.getSummary();
  }
}
