import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type {
  AdminNotificationCenterResponse,
  NotificationCenterResponse,
  NotificationRecord,
} from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
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

  @Public()
  @Get("notifications")
  @ApiOkResponse({ description: "Notification center records" })
  listNotifications(): NotificationRecord[] {
    return this.service.listNotifications();
  }

  @Public()
  @Get("notifications/center")
  @ApiOkResponse({ description: "Unread, read, archived, and history notification center" })
  getNotificationCenter(): NotificationCenterResponse {
    return this.service.getNotificationCenter();
  }

  @Public()
  @Post("notifications/:id/read")
  @ApiOkResponse({ description: "Mark notification as read" })
  markRead(@Param("id") id: string): NotificationRecord {
    return this.service.markRead(id);
  }

  @Public()
  @Post("notifications/mark-all-read")
  @ApiOkResponse({ description: "Mark all notifications as read" })
  markAllRead(): NotificationCenterResponse {
    return this.service.markAllRead();
  }

  @Public()
  @Post("notifications/:id/archive")
  @ApiOkResponse({ description: "Archive notification" })
  archive(@Param("id") id: string): NotificationRecord {
    return this.service.archive(id);
  }

  @Public()
  @Delete("notifications/:id")
  @ApiOkResponse({ description: "Delete notification from active history" })
  delete(@Param("id") id: string): NotificationCenterResponse {
    return this.service.delete(id);
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
