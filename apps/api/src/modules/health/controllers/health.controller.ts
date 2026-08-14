import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { HealthCheckResponse } from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { HealthService } from "../services/health.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly service: HealthService) {}

  @Public()
  @Get()
  @ApiOkResponse({
    description:
      "Full health check for API, database, Redis, queue, storage, email, supplier, and payment dependencies",
  })
  getHealth(): HealthCheckResponse {
    return this.service.getHealth();
  }

  @Public()
  @Get("ready")
  @ApiOkResponse({ description: "Readiness check" })
  getReady(): HealthCheckResponse {
    return this.service.getReady();
  }

  @Public()
  @Get("live")
  @ApiOkResponse({ description: "Liveness check" })
  getLive(): HealthCheckResponse {
    return this.service.getLive();
  }
}
