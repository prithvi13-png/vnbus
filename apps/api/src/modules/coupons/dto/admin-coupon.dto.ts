import { Type } from "class-transformer";
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import type {
  AdminCouponRecord,
  CreateAdminCouponRequest,
  UpdateAdminCouponRequest,
} from "@vnbus/types";

export class CreateAdminCouponDto implements CreateAdminCouponRequest {
  @IsString()
  @MaxLength(40)
  code: string;

  @IsIn(["PERCENTAGE", "FLAT"])
  type: AdminCouponRecord["type"];

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  discountValue: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  usageLimit: number;

  @IsString()
  @MaxLength(40)
  expiresAt: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minimumBookingAmount: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maximumDiscount: number;

  @IsOptional()
  @IsIn(["ACTIVE", "INACTIVE", "SCHEDULED", "EXPIRED"])
  status?: AdminCouponRecord["status"];
}

export class UpdateAdminCouponDto implements UpdateAdminCouponRequest {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  discountValue?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  expiresAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minimumBookingAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maximumDiscount?: number;

  @IsOptional()
  @IsIn(["ACTIVE", "INACTIVE", "SCHEDULED", "EXPIRED"])
  status?: AdminCouponRecord["status"];
}
