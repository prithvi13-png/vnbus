import { IsString, MaxLength, MinLength } from "class-validator";
import type { UpdateAdminPlatformSettingRequest } from "@vnbus/types";

export class UpdatePlatformSettingDto implements UpdateAdminPlatformSettingRequest {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  value: string;
}
