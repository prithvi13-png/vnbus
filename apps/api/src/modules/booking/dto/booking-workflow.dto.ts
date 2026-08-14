import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type {
  BookingPassengerInput,
  CancelBookingRequest,
  ConfirmBookingRequest,
  CreateBookingRequest,
  RescheduleBookingRequest,
} from "@vnbus/types";

export class BookingPassengerDto implements BookingPassengerInput {
  @ApiProperty({ example: "1A" })
  @IsString()
  @MaxLength(20)
  seatNumber!: string;

  @ApiProperty({ example: "Aarav" })
  @IsString()
  @MaxLength(80)
  firstName!: string;

  @ApiProperty({ example: "Sharma" })
  @IsString()
  @MaxLength(80)
  lastName!: string;

  @ApiProperty({ minimum: 1, maximum: 110, example: 32 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(110)
  age!: number;

  @ApiProperty({ enum: ["MALE", "FEMALE", "OTHER"] })
  @IsIn(["MALE", "FEMALE", "OTHER"])
  gender!: "MALE" | "FEMALE" | "OTHER";

  @ApiProperty({ example: "+919876543210" })
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/)
  phone!: string;

  @ApiProperty({ example: "traveller@example.com" })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: "+919800000000" })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/)
  emergencyContact?: string;
}

export class CreateBookingDto implements CreateBookingRequest {
  @ApiProperty({ example: "RES-00ABC123" })
  @IsString()
  @MaxLength(80)
  reservationId!: string;

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

  @ApiProperty({ example: ["1A"], isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  selectedSeats!: string[];

  @ApiProperty()
  @IsString()
  @MaxLength(120)
  boardingPointId!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(120)
  droppingPointId!: string;

  @ApiProperty({ type: [BookingPassengerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => BookingPassengerDto)
  passengers!: BookingPassengerDto[];

  @ApiPropertyOptional({ example: "+919800000000" })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/)
  emergencyContact?: string;
}

export class ConfirmBookingDto implements ConfirmBookingRequest {
  @ApiProperty({ example: "BKG-00ABC123" })
  @IsString()
  @MaxLength(80)
  bookingId!: string;

  @ApiProperty({ example: "MOCK-PAYMENT-SUCCESS" })
  @IsString()
  @MaxLength(120)
  paymentReference!: string;
}

export class CancelBookingDto implements CancelBookingRequest {
  @ApiProperty({ example: "BKG-00ABC123" })
  @IsString()
  @MaxLength(80)
  bookingId!: string;

  @ApiPropertyOptional({ example: "Traveller requested cancellation" })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  reason?: string;
}

export class RescheduleBookingDto implements RescheduleBookingRequest {
  @ApiProperty({ example: "BKG-00ABC123" })
  @IsString()
  @MaxLength(80)
  bookingId!: string;

  @ApiProperty({ example: "2026-09-14" })
  @IsDateString()
  newJourneyDate!: string;

  @ApiPropertyOptional({ example: "mock-route-001-2" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  newTripId?: string;
}
