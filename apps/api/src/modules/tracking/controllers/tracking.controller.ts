import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { TrackingSummaryDto } from "../dto/tracking-summary.dto";
import { TrackingService } from "../services/tracking.service";

@ApiTags("Tracking")
@ApiBearerAuth()
@Controller("tracking")
export class TrackingController {
  constructor(private readonly service: TrackingService) {}

  @Public()
  @Get("health")
  getHealth(): TrackingSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("capabilities")
  getCapabilities(): TrackingSummaryDto {
    return this.service.getSummary();
  }
}
