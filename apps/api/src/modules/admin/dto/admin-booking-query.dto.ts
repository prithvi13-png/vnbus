import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import type { BookingStatus as SharedBookingStatus } from "@vnbus/types";
import { BookingStatus } from "@prisma/client";

export class AdminBookingQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  bookingId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  pnr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  customer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  agent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  journeyDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  operator?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  destination?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: SharedBookingStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;
}
