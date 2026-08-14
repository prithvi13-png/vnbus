import type { PaymentProviderCode } from "@vnbus/types";

export class PaymentFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentFailedError";
  }
}

export class PaymentTimeoutError extends Error {
  constructor(providerCode: PaymentProviderCode) {
    super(`${providerCode} payment request timed out.`);
    this.name = "PaymentTimeoutError";
  }
}

export class PaymentProviderUnavailableError extends Error {
  constructor(providerCode: PaymentProviderCode) {
    super(`${providerCode} is not configured. No live payment request was attempted.`);
    this.name = "PaymentProviderUnavailableError";
  }
}
