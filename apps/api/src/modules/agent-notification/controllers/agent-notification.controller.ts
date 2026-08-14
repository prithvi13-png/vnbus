import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { NotificationRecord } from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { AgentNotificationQueryDto } from "../dto/agent-notification.dto";
import { AgentNotificationService } from "../services/agent-notification.service";

@ApiTags("Agent Notifications")
@ApiBearerAuth()
@Controller("agent/notifications")
export class AgentNotificationController {
  constructor(private readonly service: AgentNotificationService) {}

  @Public()
  @Get()
  @ApiOkResponse({ description: "Agent notification center feed" })
  listNotifications(@Query() query: AgentNotificationQueryDto): NotificationRecord[] {
    return this.service.listNotifications(query.readStatus);
  }
}
