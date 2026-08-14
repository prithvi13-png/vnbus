import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import type {
  AdminOfferRecord,
  CreateAdminOfferRequest,
  UpdateAdminOfferRequest,
} from "@vnbus/types";

export class CreateAdminOfferDto implements CreateAdminOfferRequest {
  @IsString()
  @MaxLength(180)
  title: string;

  @IsIn(["OFFER_BANNER", "FEATURED_ROUTES", "SEASONAL", "HOME_PROMOTION", "POPUP"])
  placement: AdminOfferRecord["placement"];

  @IsOptional()
  @IsString()
  @MaxLength(180)
  route?: string | null;

  @IsString()
  @MaxLength(40)
  startsAt: string;

  @IsString()
  @MaxLength(40)
  endsAt: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  priority?: number;

  @IsOptional()
  @IsIn(["ACTIVE", "INACTIVE", "SCHEDULED", "DRAFT"])
  status?: AdminOfferRecord["status"];
}

export class UpdateAdminOfferDto implements UpdateAdminOfferRequest {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  route?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  startsAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  endsAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  priority?: number;

  @IsOptional()
  @IsIn(["ACTIVE", "INACTIVE", "SCHEDULED", "DRAFT"])
  status?: AdminOfferRecord["status"];
}
