import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { PassengerSummaryDto } from "../dto/passenger-summary.dto";
import { PassengerService } from "../services/passenger.service";

@ApiTags("Passenger")
@ApiBearerAuth()
@Controller("passenger")
export class PassengerController {
  constructor(private readonly service: PassengerService) {}

  @Public()
  @Get("health")
  getHealth(): PassengerSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("capabilities")
  getCapabilities(): PassengerSummaryDto {
    return this.service.getSummary();
  }
}
