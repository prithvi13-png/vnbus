import type {
  CapturePaymentRequest,
  CreatePaymentIntentRequest,
  PaymentIntent,
  PaymentProviderCode,
  PaymentResult,
  PaymentStatus,
  Refund,
} from "@vnbus/types";

import type {
  ParsedPaymentWebhook,
  PaymentProvider,
  RefundPaymentRequest,
} from "../interfaces/payment-provider.interface";
import { PaymentProviderUnavailableError } from "../services/payment-errors";

abstract class NotConfiguredPaymentAdapter implements PaymentProvider {
  abstract readonly code: PaymentProviderCode;
  abstract readonly name: string;

  createIntent(_request: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    return this.reject();
  }

  capturePayment(_request: CapturePaymentRequest, _intent: PaymentIntent): Promise<PaymentResult> {
    return this.reject();
  }

  refund(_request: RefundPaymentRequest): Promise<Refund> {
    return this.reject();
  }

  getStatus(_paymentIntentId: string): Promise<PaymentStatus> {
    return this.reject();
  }

  verifyWebhookSignature(_payload: unknown, _signature: string | undefined): Promise<boolean> {
    return Promise.resolve(false);
  }

  parseWebhook(_payload: unknown): Promise<ParsedPaymentWebhook> {
    return this.reject();
  }

  protected reject<T>(): Promise<T> {
    return Promise.reject(new PaymentProviderUnavailableError(this.code));
  }
}

export class RazorpayAdapter extends NotConfiguredPaymentAdapter {
  readonly code = "RAZORPAY";
  readonly name = "Razorpay";
}

export class CashfreeAdapter extends NotConfiguredPaymentAdapter {
  readonly code = "CASHFREE";
  readonly name = "Cashfree";
}

export class PhonePeAdapter extends NotConfiguredPaymentAdapter {
  readonly code = "PHONEPE";
  readonly name = "PhonePe";
}

export class StripeAdapter extends NotConfiguredPaymentAdapter {
  readonly code = "STRIPE";
  readonly name = "Stripe";
}

export class CustomPaymentAdapter extends NotConfiguredPaymentAdapter {
  readonly code = "CUSTOM";
  readonly name = "Custom Payment API";
}

export const paymentProviderAdapters = [
  RazorpayAdapter,
  CashfreeAdapter,
  PhonePeAdapter,
  StripeAdapter,
  CustomPaymentAdapter,
] as const;
