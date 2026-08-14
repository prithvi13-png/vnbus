import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
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

import { PasswordsMatch } from "../../auth/validators/password-confirmation.validator";
import {
  strongPasswordMessage,
  strongPasswordPattern,
} from "../../auth/validators/password-policy.validator";

export class CreateUserDto {
  @ApiProperty({ example: "Meera" })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  firstName: string;

  @ApiProperty({ example: "Iyer" })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName: string;

  @ApiProperty({ example: "agent@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "+919876543211" })
  @IsString()
  @Matches(/^\+?[1-9]\d{9,14}$/u, {
    message: "phone must be a valid E.164-compatible number",
  })
  phone: string;

  @ApiProperty({ minLength: 12, example: "VNexus#2026Pass" })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(strongPasswordPattern, { message: strongPasswordMessage })
  password: string;

  @ApiProperty({ minLength: 12, example: "VNexus#2026Pass" })
  @IsString()
  @PasswordsMatch()
  confirmPassword: string;

  @ApiProperty({ example: "TRAVEL_AGENT" })
  @IsString()
  @Matches(/^[A-Z][A-Z0-9_]{1,79}$/u, {
    message: "roleCode must be an uppercase role code",
  })
  roleCode: string;

  @ApiPropertyOptional({ enum: UserStatus, default: UserStatus.ACTIVE })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  forcePasswordChange?: boolean;
}
