import { IsOptional, IsString } from "class-validator";
import type { RecentlyViewedRouteRequest } from "@vnbus/types";

export class RecommendationQueryDto {
  @IsOptional()
  @IsString()
  sourceCity?: string;

  @IsOptional()
  @IsString()
  destinationCity?: string;
}

export class RecentlyViewedRouteDto implements RecentlyViewedRouteRequest {
  @IsString()
  sourceCity!: string;

  @IsString()
  destinationCity!: string;

  @IsOptional()
  @IsString()
  viewedAt?: string;
}
