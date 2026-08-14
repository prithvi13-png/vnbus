import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";
import type { UpdateMaintenanceModeRequest } from "@vnbus/types";

export class UpdateMaintenanceModeDto implements UpdateMaintenanceModeRequest {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  message?: string;
}
