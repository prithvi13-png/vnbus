import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import type { UpdateSeatLayoutAdminConfigRequest } from "@vnbus/types";

export class UpdateSeatLayoutConfigDto implements UpdateSeatLayoutAdminConfigRequest {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  layoutName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  baseFareAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  windowPremiumAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  extraLegroomPremiumAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  sleeperPremiumAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  upperDeckPremiumAmount?: number;

  @IsOptional()
  @IsBoolean()
  lowerDeckEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  upperDeckEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  maxSelectableSeats?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  maleSeatNumbers?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  femaleSeatNumbers?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  femaleBookedSeatNumbers?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bookedSeatNumbers?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blockedSeatNumbers?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  updatedBy?: string;
}
