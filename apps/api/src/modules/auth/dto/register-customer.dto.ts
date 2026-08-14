import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

import {
  strongPasswordMessage,
  strongPasswordPattern,
} from "../validators/password-policy.validator";
import { PasswordsMatch } from "../validators/password-confirmation.validator";

export class RegisterCustomerDto {
  @ApiProperty({ example: "Aarav" })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  firstName: string;

  @ApiProperty({ example: "Sharma" })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName: string;

  @ApiProperty({ example: "traveller@example.com" })
  @IsEmail()
  email: string;

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

  @ApiProperty({ example: "+919876543210" })
  @IsString()
  @Matches(/^\+?[1-9]\d{9,14}$/u, {
    message: "phone must be a valid E.164-compatible number",
  })
  phone: string;
}
