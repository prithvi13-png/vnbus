import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";
import type {
  CapturePaymentRequest,
  CreatePaymentIntentRequest,
  Money,
  PaymentProviderCode,
} from "@vnbus/types";

const paymentProviderCodes = [
  "MOCK",
  "RAZORPAY",
  "CASHFREE",
  "PHONEPE",
  "STRIPE",
  "CUSTOM",
] as const;

export class MoneyDto implements Money {
  @ApiProperty({ example: 1710 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: "INR" })
  @IsString()
  currency!: Money["currency"];
}

export class CreatePaymentIntentDto implements CreatePaymentIntentRequest {
  @ApiProperty({ example: "BKG-00000001" })
  @IsString()
  @MaxLength(120)
  bookingId!: string;

  @ApiProperty({ type: MoneyDto })
  amount!: Money;

  @ApiProperty({ required: false, example: "INR" })
  @IsOptional()
  @IsString()
  currency?: "INR" | "USD";

  @ApiProperty({ required: false, enum: paymentProviderCodes })
  @IsOptional()
  @IsIn(paymentProviderCodes)
  providerCode?: PaymentProviderCode;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  idempotencyKey?: string;
}

export class CapturePaymentDto implements Omit<CapturePaymentRequest, "paymentIntentId"> {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  providerReference?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  idempotencyKey?: string;
}

export function parsePaymentProviderCode(value: string): PaymentProviderCode {
  const normalized = value.trim().toUpperCase();

  if (!paymentProviderCodes.includes(normalized as PaymentProviderCode)) {
    throw new Error(`Unsupported payment provider: ${value}`);
  }

  return normalized as PaymentProviderCode;
}
