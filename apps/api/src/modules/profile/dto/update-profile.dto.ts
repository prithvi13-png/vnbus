import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "Aarav" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  firstName?: string;

  @ApiPropertyOptional({ example: "Sharma" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName?: string;

  @ApiPropertyOptional({ example: "+919876543210" })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{9,14}$/u, {
    message: "phone must be a valid E.164-compatible number",
  })
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatar?: string;
}
