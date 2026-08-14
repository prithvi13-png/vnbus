import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MaxLength, MinLength } from "class-validator";

import { PasswordsMatch } from "../validators/password-confirmation.validator";
import {
  strongPasswordMessage,
  strongPasswordPattern,
} from "../validators/password-policy.validator";

export class ChangePasswordDto {
  @ApiProperty({ minLength: 12 })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  currentPassword: string;

  @ApiProperty({ minLength: 12 })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(strongPasswordPattern, { message: strongPasswordMessage })
  newPassword: string;

  @ApiProperty({ minLength: 12 })
  @IsString()
  @PasswordsMatch()
  confirmPassword: string;
}
