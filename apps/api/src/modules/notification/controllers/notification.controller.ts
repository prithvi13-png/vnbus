import { Body, Controller, Delete, Get, Param, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type {
  AdminNotificationCenterResponse,
  NotificationCenterResponse,
  NotificationRecord,
} from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import type { AuthenticatedRequest } from "../../../shared/security/interfaces/authenticated-request.interface";
import { requireUserId } from "../../../shared/security/require-user";
import { SendAdminNotificationDto } from "../dto/admin-notification.dto";
import { NotificationSummaryDto } from "../dto/notification-summary.dto";
import { NotificationService } from "../services/notification.service";

@ApiTags("Notification")
@ApiBearerAuth()
@Controller()
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Public()
  @Get("notification/health")
  getHealth(): NotificationSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("notification/capabilities")
  getCapabilities(): NotificationSummaryDto {
    return this.service.getSummary();
  }

  // The signed-in user's own notifications. These carry booking references and
  // passenger names, so none of them is public.
  @Get("notifications")
  @ApiOkResponse({ description: "Notification center records" })
  listNotifications(@Req() request: AuthenticatedRequest): NotificationRecord[] {
    return this.service.listNotifications(requireUserId(request));
  }

  @Get("notifications/center")
  @ApiOkResponse({ description: "Unread, read, archived, and history notification center" })
  getNotificationCenter(@Req() request: AuthenticatedRequest): NotificationCenterResponse {
    return this.service.getNotificationCenter(requireUserId(request));
  }

  @Post("notifications/:id/read")
  @ApiOkResponse({ description: "Mark notification as read" })
  markRead(@Param("id") id: string, @Req() request: AuthenticatedRequest): NotificationRecord {
    return this.service.markRead(id, requireUserId(request));
  }

  @Post("notifications/mark-all-read")
  @ApiOkResponse({ description: "Mark all notifications as read" })
  markAllRead(@Req() request: AuthenticatedRequest): NotificationCenterResponse {
    return this.service.markAllRead(requireUserId(request));
  }

  @Post("notifications/:id/archive")
  @ApiOkResponse({ description: "Archive notification" })
  archive(@Param("id") id: string, @Req() request: AuthenticatedRequest): NotificationRecord {
    return this.service.archive(id, requireUserId(request));
  }

  @Delete("notifications/:id")
  @ApiOkResponse({ description: "Delete notification from active history" })
  delete(
    @Param("id") id: string,
    @Req() request: AuthenticatedRequest,
  ): NotificationCenterResponse {
    return this.service.delete(id, requireUserId(request));
  }

  @Roles("ADMIN")
  @Get("admin/notifications")
  @ApiOkResponse({ description: "Admin notification center with history, templates, and queue" })
  getAdminCenter(): AdminNotificationCenterResponse {
    return this.service.getAdminCenter();
  }

  @Roles("ADMIN")
  @Post("admin/notifications/send")
  @ApiOkResponse({ description: "Send customer, agent, or broadcast notification" })
  sendAdminNotification(@Body() dto: SendAdminNotificationDto): NotificationRecord {
    return this.service.sendAdminNotification(dto);
  }
}
