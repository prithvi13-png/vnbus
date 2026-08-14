import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import type { SendAdminNotificationRequest } from "@vnbus/types";

export class SendAdminNotificationDto implements SendAdminNotificationRequest {
  @IsIn(["CUSTOMER", "AGENT", "BROADCAST"])
  audience: SendAdminNotificationRequest["audience"];

  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title: string;

  @IsString()
  @MinLength(2)
  @MaxLength(500)
  body: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  templateId?: string;
}
