import { Type } from "class-transformer";
import { IsBoolean, IsIn, IsInt, IsOptional, Max, Min } from "class-validator";
import type {
  AdminSupplierConfigurationRecord,
  UpdateAdminSupplierConfigurationRequest,
} from "@vnbus/types";

export class UpdateSupplierConfigurationDto implements UpdateAdminSupplierConfigurationRequest {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  priority?: number;

  @IsOptional()
  @IsIn(["MOCK", "SANDBOX_PLACEHOLDER", "PRODUCTION_PLACEHOLDER"])
  environment?: AdminSupplierConfigurationRecord["environment"];
}
