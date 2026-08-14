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

export class MockPaymentAdapter implements PaymentProvider {
  readonly code = "MOCK";
  readonly name = "Mock Payment";

  createIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    const now = new Date();
    const idempotencyKey =
      request.idempotencyKey ??
      `payment-intent:${request.bookingId}:${request.amount.amount}:${request.amount.currency}`;

    return Promise.resolve({
      paymentIntentId: createPaymentId("PAYINT"),
      providerCode: this.code,
      bookingId: request.bookingId,
      amount: request.amount,
      currency: request.currency ?? request.amount.currency,
      status: "CREATED",
      idempotencyKey,
      clientSecret: null,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
    });
  }

  capturePayment(request: CapturePaymentRequest, intent: PaymentIntent): Promise<PaymentResult> {
    return Promise.resolve({
      paymentIntentId: request.paymentIntentId,
      transactionId: createPaymentId("PAYTXN"),
      providerCode: this.code,
      status: "CAPTURED",
      amount: intent.amount,
      providerReference:
        request.providerReference ?? `MOCKREF-${request.paymentIntentId.slice(-8)}`,
      capturedAt: new Date().toISOString(),
      failureCode: null,
      failureMessage: null,
    });
  }

  refund(request: RefundPaymentRequest): Promise<Refund> {
    return Promise.resolve({
      refundId: createPaymentId("RFND"),
      paymentIntentId: request.paymentIntentId,
      transactionId: request.transactionId,
      amount: request.amount,
      status: "PROCESSED",
      reason: request.reason,
      providerReference: `MOCKRFND-${request.transactionId.slice(-8)}`,
      createdAt: new Date().toISOString(),
    });
  }

  getStatus(_paymentIntentId: string): Promise<PaymentStatus> {
    return Promise.resolve("CAPTURED");
  }

  verifyWebhookSignature(_payload: unknown, signature: string | undefined): Promise<boolean> {
    return Promise.resolve(!signature || signature === "mock-signature");
  }

  parseWebhook(payload: unknown): Promise<ParsedPaymentWebhook> {
    const body = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
    const parsed: ParsedPaymentWebhook = {
      eventId: primitiveString(body.eventId, createPaymentId("MOCKEVT")),
      eventType: primitiveString(body.eventType, "payment.captured"),
      status: typeof body.status === "string" ? (body.status as PaymentStatus) : "CAPTURED",
    };

    if (typeof body.paymentIntentId === "string") {
      parsed.paymentIntentId = body.paymentIntentId;
    }
    if (typeof body.providerReference === "string") {
      parsed.providerReference = body.providerReference;
    }

    return Promise.resolve(parsed);
  }
}

export const paymentProviderAdapters = [
  MockPaymentAdapter,
  RazorpayAdapter,
  CashfreeAdapter,
  PhonePeAdapter,
  StripeAdapter,
  CustomPaymentAdapter,
] as const;

function createPaymentId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

function primitiveString(value: unknown, fallback: string): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}
