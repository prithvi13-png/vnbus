import { ApiPropertyOptional } from "@nestjs/swagger";
import { UserStatus } from "@prisma/client";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "Meera" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  firstName?: string;

  @ApiPropertyOptional({ example: "Iyer" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName?: string;

  @ApiPropertyOptional({ example: "agent@example.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: "+919876543211" })
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

  @ApiPropertyOptional({ example: "TRAVEL_AGENT" })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z][A-Z0-9_]{1,79}$/u, {
    message: "roleCode must be an uppercase role code",
  })
  roleCode?: string;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  forcePasswordChange?: boolean;
}
