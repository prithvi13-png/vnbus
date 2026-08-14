import { IsIn, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import type { NotificationReadStatus } from "@vnbus/types";

export class AgentNotificationQueryDto {
  @ApiPropertyOptional({ enum: ["READ", "UNREAD"] })
  @IsOptional()
  @IsIn(["READ", "UNREAD"])
  readStatus?: NotificationReadStatus;
}
