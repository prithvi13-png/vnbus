import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsString,
  MaxLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import type { SeatHoldRequest, SeatReleaseRequest } from "@vnbus/types";

export class HoldSeatsDto implements SeatHoldRequest {
  @ApiProperty({ example: "MOCK" })
  @IsString()
  @MaxLength(40)
  supplierCode!: string;

  @ApiProperty({ example: "mock-route-001-1" })
  @IsString()
  @MaxLength(120)
  tripId!: string;

  @ApiProperty({ example: "2026-09-10" })
  @IsDateString()
  journeyDate!: string;

  @ApiProperty({ example: ["1A", "1B"], isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  @Type(() => String)
  seatNumbers!: string[];
}

export class ReleaseSeatsDto implements SeatReleaseRequest {
  @ApiProperty({ example: "RES-00ABC123" })
  @IsString()
  @MaxLength(80)
  reservationId!: string;
}
