import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MaxLength, MinLength } from "class-validator";

import {
  strongPasswordMessage,
  strongPasswordPattern,
} from "../validators/password-policy.validator";
import { PasswordsMatch } from "../validators/password-confirmation.validator";

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(32)
  token: string;

  @ApiProperty({ minLength: 12 })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(strongPasswordPattern, { message: strongPasswordMessage })
  password: string;

  @ApiProperty({ minLength: 12 })
  @IsString()
  @PasswordsMatch()
  confirmPassword: string;
}
