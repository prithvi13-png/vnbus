import { Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { BackgroundJobRecord, SchedulerDashboardResponse } from "@vnbus/types";

import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { SchedulerService } from "../services/scheduler.service";

@ApiTags("Scheduler")
@ApiBearerAuth()
@Controller("scheduler")
export class SchedulerController {
  constructor(private readonly service: SchedulerService) {}

  @Roles("ADMIN")
  @Get("jobs")
  @ApiOkResponse({ description: "Background job schedules and scheduler queue status" })
  getDashboard(): SchedulerDashboardResponse {
    return this.service.getDashboard();
  }

  @Roles("ADMIN")
  @Post("jobs/:jobId/run")
  @ApiOkResponse({ description: "Run a background job immediately" })
  run(@Param("jobId") jobId: string): BackgroundJobRecord {
    return this.service.run(jobId);
  }
}
