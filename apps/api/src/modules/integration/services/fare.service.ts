import { Injectable } from "@nestjs/common";
import type { Money } from "@vnbus/types";

export interface FareCalculationInput {
  supplierFare: Money;
  taxRate?: number;
  discount?: Money;
  markup?: Money;
  agentPricing?: Money;
  convenienceFee?: Money;
  previousFare?: Money;
}

export interface FareCalculationResult {
  baseFare: Money;
  taxes: Money;
  discount: Money;
  markup: Money;
  agentPricing: Money;
  convenienceFee: Money;
  finalFare: Money;
  supplierFare: Money;
  fareDifference: Money;
}

@Injectable()
export class FareService {
  calculate(input: FareCalculationInput): FareCalculationResult {
    const baseFare = input.supplierFare;
    const taxes = money(baseFare.amount * (input.taxRate ?? 0.05), baseFare.currency);
    const discount = input.discount ?? money(0, baseFare.currency);
    const markup = input.markup ?? money(0, baseFare.currency);
    const agentPricing = input.agentPricing ?? money(0, baseFare.currency);
    const convenienceFee = input.convenienceFee ?? money(40, baseFare.currency);
    const finalAmount =
      baseFare.amount +
      taxes.amount +
      markup.amount +
      agentPricing.amount +
      convenienceFee.amount -
      discount.amount;

    return {
      baseFare,
      taxes,
      discount,
      markup,
      agentPricing,
      convenienceFee,
      finalFare: money(finalAmount, baseFare.currency),
      supplierFare: baseFare,
      fareDifference: money(
        finalAmount - (input.previousFare?.amount ?? finalAmount),
        baseFare.currency,
      ),
    };
  }
}

function money(amount: number, currency: Money["currency"]): Money {
  const rounded = Number(amount.toFixed(2));

  return {
    amount: rounded,
    currency,
  };
}
