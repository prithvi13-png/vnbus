import { Type } from "class-transformer";
import {
  ArrayMaxSize,
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
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type {
  AgentCustomerListQuery,
  AgentCustomerStatus,
  CreateAgentCustomerRequest,
  UpdateAgentCustomerRequest,
} from "@vnbus/types";

const customerStatuses = ["ACTIVE", "INACTIVE", "VIP", "BLOCKED"] as const;
const genders = ["MALE", "FEMALE", "OTHER"] as const;

export class AgentCustomerListQueryDto implements AgentCustomerListQuery {
  @ApiPropertyOptional({ example: "Aarav" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({ example: "VIP" })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  tag?: string;

  @ApiPropertyOptional({ enum: customerStatuses })
  @IsOptional()
  @IsIn(customerStatuses)
  status?: AgentCustomerStatus;

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

export class CreateAgentCustomerDto implements CreateAgentCustomerRequest {
  @ApiProperty({ example: "Aarav Sharma" })
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiProperty({ example: "aarav@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "+919876543210" })
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/)
  phone!: string;

  @ApiProperty({ enum: genders })
  @IsIn(genders)
  gender!: "MALE" | "FEMALE" | "OTHER";

  @ApiPropertyOptional({ example: "1991-06-12" })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: "+919800000000" })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/)
  emergencyContact?: string;

  @ApiPropertyOptional({ example: ["Bangalore to Hyderabad"], isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  preferredRoutes?: string[];

  @ApiPropertyOptional({ example: "Prefers lower berth." })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ example: ["VIP", "Corporate"], isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateAgentCustomerDto implements UpdateAgentCustomerRequest {
  @ApiPropertyOptional({ example: "Aarav Sharma" })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional({ example: "aarav@example.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: "+919876543210" })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/)
  phone?: string;

  @ApiPropertyOptional({ enum: genders })
  @IsOptional()
  @IsIn(genders)
  gender?: "MALE" | "FEMALE" | "OTHER";

  @ApiPropertyOptional({ example: "1991-06-12", nullable: true })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string | null;

  @ApiPropertyOptional({ example: "+919800000000", nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/)
  emergencyContact?: string | null;

  @ApiPropertyOptional({ example: ["Bangalore to Hyderabad"], isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  preferredRoutes?: string[];

  @ApiPropertyOptional({ example: "Prefers lower berth." })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ example: ["VIP", "Corporate"], isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: customerStatuses })
  @IsOptional()
  @IsIn(customerStatuses)
  status?: AgentCustomerStatus;
}
