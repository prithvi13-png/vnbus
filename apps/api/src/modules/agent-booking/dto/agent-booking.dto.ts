import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional, IntersectionType } from "@nestjs/swagger";
import type {
  AgentBookingListQuery,
  AgentEmailTicketRequest,
  BookingStatus,
  CreateAgentBookingRequest,
} from "@vnbus/types";

import { CreateBookingDto } from "../../booking/dto/booking-workflow.dto";
import { TicketEmailDto } from "../../ticket/dto/ticket-workflow.dto";

const bookingStatuses: BookingStatus[] = [
  "DRAFT",
  "SEAT_HELD",
  "PENDING_PAYMENT",
  "CONFIRMED",
  "TICKET_GENERATED",
  "CANCELLATION_REQUESTED",
  "CANCELLED",
  "REFUND_PENDING",
  "EXPIRED",
  "FAILED",
  "RESCHEDULED",
];

export class AgentBookingListQueryDto implements AgentBookingListQuery {
  @ApiPropertyOptional({ example: "VNB-001" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({ example: "2026-09-10" })
  @IsOptional()
  @IsDateString()
  journeyDate?: string;

  @ApiPropertyOptional({ example: "Vriddhi Express" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  operator?: string;

  @ApiPropertyOptional({ enum: bookingStatuses })
  @IsOptional()
  @IsIn(bookingStatuses)
  status?: BookingStatus;

  @ApiPropertyOptional({ example: "Bangalore" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;

  @ApiPropertyOptional({ example: "Hyderabad" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  destination?: string;

  @ApiPropertyOptional({ example: "BKG-001" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  bookingId?: string;

  @ApiPropertyOptional({ example: "Aarav" })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  customerName?: string;

  @ApiPropertyOptional({ example: "+919876543210" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiPropertyOptional({ enum: ["createdAt", "journeyDate", "amount", "status"] })
  @IsOptional()
  @IsIn(["createdAt", "journeyDate", "amount", "status"])
  sortBy?: "createdAt" | "journeyDate" | "amount" | "status";

  @ApiPropertyOptional({ enum: ["asc", "desc"] })
  @IsOptional()
  @IsIn(["asc", "desc"])
  sortDirection?: "asc" | "desc";

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

class AgentBookingOwnershipDto {
  @ApiProperty({ example: "CUS-AGT-001" })
  @IsString()
  @MaxLength(80)
  customerId!: string;

  @ApiPropertyOptional({ example: "AGENT-MOCK-PAYMENT" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  paymentReference?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  emailTicket?: boolean;
}

export class CreateAgentBookingDto
  extends IntersectionType(CreateBookingDto, AgentBookingOwnershipDto)
  implements CreateAgentBookingRequest {}

export class AgentEmailTicketDto extends TicketEmailDto implements AgentEmailTicketRequest {
  @ApiPropertyOptional({ example: "AGT-VN-001" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  agentId?: string;
}
