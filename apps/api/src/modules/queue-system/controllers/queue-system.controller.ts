import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { QueueDashboardResponse } from "@vnbus/types";

import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { EnqueueJobDto } from "../dto/enqueue-job.dto";
import { QueueSystemService } from "../services/queue-system.service";

@ApiTags("Queue System")
@ApiBearerAuth()
@Controller("queues")
export class QueueSystemController {
  constructor(private readonly service: QueueSystemService) {}

  @Roles("ADMIN")
  @Get()
  @ApiOkResponse({ description: "BullMQ queue dashboard with retry and dead-letter state" })
  getDashboard(): QueueDashboardResponse {
    return this.service.getDashboard();
  }

  @Roles("ADMIN")
  @Post("enqueue")
  @ApiOkResponse({ description: "Add a mock BullMQ job to a queue" })
  enqueue(@Body() dto: EnqueueJobDto): QueueDashboardResponse {
    return this.service.enqueue(dto);
  }
}
