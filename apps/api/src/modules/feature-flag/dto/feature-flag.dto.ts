import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import type { UpdateAdminFeatureFlagRequest } from "@vnbus/types";

export class UpdateFeatureFlagDto implements UpdateAdminFeatureFlagRequest {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  rolloutPercentage?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}
