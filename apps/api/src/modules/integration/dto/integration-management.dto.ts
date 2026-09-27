import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsInt, IsOptional, Min } from "class-validator";
import type { SupplierCode } from "@vnbus/types";
import { SUPPLIER_CODES } from "@vnbus/supplier-sdk";

// Derived from the SDK rather than re-listed: a hand-kept copy silently went
// stale when SRDV was added.
const supplierCodes = SUPPLIER_CODES;

export class UpdateSupplierIntegrationDto {
  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;
}

export function parseSupplierCode(value: string): SupplierCode {
  const normalized = value.trim().toUpperCase();

  if (!supplierCodes.includes(normalized as SupplierCode)) {
    throw new Error(`Unsupported supplier code: ${value}`);
  }

  return normalized as SupplierCode;
}

export class SupplierCodeParamDto {
  @ApiProperty({ enum: supplierCodes })
  @IsIn(supplierCodes)
  code!: SupplierCode;
}
