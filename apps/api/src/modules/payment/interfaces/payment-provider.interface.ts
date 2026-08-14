import type {
  CapturePaymentRequest,
  CreatePaymentIntentRequest,
  PaymentIntent,
  PaymentProviderCode,
  PaymentResult,
  PaymentStatus,
  PaymentWebhookResult,
  Refund,
} from "@vnbus/types";

export interface RefundPaymentRequest {
  paymentIntentId: string;
  transactionId: string;
  amount: CreatePaymentIntentRequest["amount"];
  reason: string;
  idempotencyKey?: string;
}

export interface ParsedPaymentWebhook {
  eventId: string;
  eventType: string;
  paymentIntentId?: string;
  providerReference?: string;
  status?: PaymentStatus;
}

export interface PaymentProvider {
  readonly code: PaymentProviderCode;
  readonly name: string;
  createIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntent>;
  capturePayment(request: CapturePaymentRequest, intent: PaymentIntent): Promise<PaymentResult>;
  refund(request: RefundPaymentRequest): Promise<Refund>;
  getStatus(paymentIntentId: string): Promise<PaymentStatus>;
  verifyWebhookSignature(payload: unknown, signature: string | undefined): Promise<boolean>;
  parseWebhook(payload: unknown): Promise<ParsedPaymentWebhook>;
}

export interface PaymentWebhookHandler {
  handleWebhook(
    providerCode: PaymentProviderCode,
    payload: unknown,
    signature?: string,
  ): Promise<PaymentWebhookResult>;
}
