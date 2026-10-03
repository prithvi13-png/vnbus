import { Controller, Get, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { NotificationRecord } from "@vnbus/types";

import { Roles } from "../../../shared/security/decorators/roles.decorator";
import type { AuthenticatedRequest } from "../../../shared/security/interfaces/authenticated-request.interface";
import { requireUserId } from "../../../shared/security/require-user";
import { AgentNotificationQueryDto } from "../dto/agent-notification.dto";
import { AgentNotificationService } from "../services/agent-notification.service";

@ApiTags("Agent Notifications")
@ApiBearerAuth()
@Controller("agent/notifications")
export class AgentNotificationController {
  constructor(private readonly service: AgentNotificationService) {}

  @Roles("TRAVEL_AGENT")
  @Get()
  @ApiOkResponse({ description: "Agent notification center feed" })
  listNotifications(
    @Query() query: AgentNotificationQueryDto,
    @Req() request: AuthenticatedRequest,
  ): NotificationRecord[] {
    return this.service.listNotifications(requireUserId(request), query.readStatus);
  }
}
