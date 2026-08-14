import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type {
  BusAmenity,
  BusSearchRequest,
  BusType,
  SearchSortOption,
  SearchTimeWindow,
} from "@vnbus/types";

const busTypes = [
  "AC Sleeper",
  "Non AC Sleeper",
  "Seater",
  "Semi Sleeper",
  "Volvo",
  "Mercedes",
  "Luxury",
  "Electric",
] as const satisfies BusType[];

const amenities = [
  "WiFi",
  "Charging Point",
  "Blanket",
  "Water Bottle",
  "GPS",
  "Reading Light",
  "CCTV",
  "Emergency Exit",
  "USB Charger",
  "Live Tracking",
] as const satisfies BusAmenity[];

const timeWindows = [
  "BEFORE_6",
  "MORNING",
  "AFTERNOON",
  "EVENING",
] as const satisfies SearchTimeWindow[];

export class SearchTripsDto implements BusSearchRequest {
  @ApiProperty({ example: "Bangalore" })
  @IsString()
  @MaxLength(80)
  sourceCity!: string;

  @ApiProperty({ example: "Hyderabad" })
  @IsString()
  @MaxLength(80)
  destinationCity!: string;

  @ApiProperty({ example: "2026-09-10" })
  @IsDateString()
  journeyDate!: string;

  @ApiProperty({ minimum: 1, maximum: 6, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(6)
  passengerCount = 1;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: timeWindows, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsIn(timeWindows, { each: true })
  departureWindows?: SearchTimeWindow[];

  @ApiPropertyOptional({ enum: timeWindows, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsIn(timeWindows, { each: true })
  arrivalWindows?: SearchTimeWindow[];

  @ApiPropertyOptional({ enum: busTypes, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsIn(busTypes, { each: true })
  busTypes?: BusType[];

  @ApiPropertyOptional({ example: ["Vriddhi Express"], isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(25)
  @IsString({ each: true })
  operators?: string[];

  @ApiPropertyOptional({ enum: amenities, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsIn(amenities, { each: true })
  amenities?: BusAmenity[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  ac?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  nonAc?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  sleeper?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  seater?: boolean;

  @ApiPropertyOptional({ minimum: 1, maximum: 60 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  minAvailableSeats?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  liveTracking?: boolean;

  @ApiPropertyOptional({
    enum: [
      "PRICE_ASC",
      "PRICE_DESC",
      "DEPARTURE_ASC",
      "ARRIVAL_ASC",
      "FASTEST",
      "DURATION_ASC",
      "RATING_DESC",
      "POPULARITY_DESC",
    ],
  })
  @IsOptional()
  @IsIn([
    "PRICE_ASC",
    "PRICE_DESC",
    "DEPARTURE_ASC",
    "ARRIVAL_ASC",
    "FASTEST",
    "DURATION_ASC",
    "RATING_DESC",
    "POPULARITY_DESC",
  ])
  sortBy?: SearchSortOption;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;
}
