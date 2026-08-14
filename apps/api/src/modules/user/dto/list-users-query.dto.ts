import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { UserStatus } from "@prisma/client";

export class ListUsersQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z][A-Z0-9_]{1,79}$/u, {
    message: "roleCode must be an uppercase role code",
  })
  roleCode?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeDeleted = false;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 50;
}
