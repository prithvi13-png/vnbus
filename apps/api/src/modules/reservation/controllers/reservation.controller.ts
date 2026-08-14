import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { ReservationSummaryDto } from "../dto/reservation-summary.dto";
import { ReservationService } from "../services/reservation.service";

@ApiTags("Reservation")
@ApiBearerAuth()
@Controller("reservation")
export class ReservationController {
  constructor(private readonly service: ReservationService) {}

  @Public()
  @Get("health")
  getHealth(): ReservationSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("capabilities")
  getCapabilities(): ReservationSummaryDto {
    return this.service.getSummary();
  }
}
