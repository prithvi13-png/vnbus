import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MaxLength } from "class-validator";
import type { TicketEmailRequest } from "@vnbus/types";

export class TicketEmailDto implements TicketEmailRequest {
  @ApiProperty({ example: "BKG-00ABC123" })
  @IsString()
  @MaxLength(80)
  bookingId!: string;

  @ApiPropertyOptional({ example: "traveller@example.com" })
  @IsOptional()
  @IsEmail()
  to?: string;
}
