import { IsArray, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import type {
  CreateAdminRoleRequest,
  UpdateAdminRoleRequest,
  UpdateRolePermissionsRequest,
} from "@vnbus/types";

export class CreateRoleDto implements CreateAdminRoleRequest {
  @IsString()
  @Matches(/^[A-Z][A-Z0-9_]{1,79}$/u)
  code: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class UpdateRoleDto implements UpdateAdminRoleRequest {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string | null;
}

export class UpdateRolePermissionsDto implements UpdateRolePermissionsRequest {
  @IsArray()
  @IsString({ each: true })
  permissionCodes: string[];
}
