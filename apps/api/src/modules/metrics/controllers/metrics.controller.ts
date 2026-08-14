import { Controller, Get, Header } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { MetricsResponse } from "@vnbus/types";

import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { Public } from "../../../shared/security/decorators/public.decorator";
import { MetricsService } from "../services/metrics.service";

@ApiTags("Metrics")
@ApiBearerAuth()
@Controller("metrics")
export class MetricsController {
  constructor(private readonly service: MetricsService) {}

  @Roles("ADMIN")
  @Get()
  @ApiOkResponse({ description: "API, queue, cache, memory, CPU, and storage metrics" })
  getMetrics(): MetricsResponse {
    return this.service.getMetrics();
  }

  @Public()
  @Get("prometheus")
  @Header("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
  @ApiOkResponse({ description: "Prometheus-compatible scrape output" })
  getPrometheusMetrics(): string {
    return this.service.getPrometheusMetrics();
  }
}
