import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  CapturePaymentRequest,
  CreatePaymentIntentRequest,
  PaymentIntent,
  PaymentProviderCode,
  PaymentProviderConfig,
  PaymentResult,
  PaymentTransaction,
  PaymentWebhookResult,
} from "@vnbus/types";

import { IdempotencyService } from "../../integration/services/idempotency.service";
import { IntegrationConfigurationService } from "../../integration/services/integration-configuration.service";
import {
  CashfreeAdapter,
  CustomPaymentAdapter,
  MockPaymentAdapter,
  PhonePeAdapter,
  RazorpayAdapter,
  StripeAdapter,
} from "../adapters/payment-provider.adapters";
import type { PaymentProvider } from "../interfaces/payment-provider.interface";
import { PaymentFailedError, PaymentProviderUnavailableError } from "./payment-errors";
import { PaymentRepository } from "../repositories/payment.repository";

@Injectable()
export class PaymentService {
  private readonly providers = new Map<PaymentProviderCode, PaymentProvider>();

  constructor(
    private readonly repository: PaymentRepository,
    private readonly configuration: IntegrationConfigurationService,
    private readonly idempotency: IdempotencyService,
  ) {
    [
      new MockPaymentAdapter(),
      new RazorpayAdapter(),
      new CashfreeAdapter(),
      new PhonePeAdapter(),
      new StripeAdapter(),
      new CustomPaymentAdapter(),
    ].forEach((provider) => this.providers.set(provider.code, provider));
  }

  listProviders(): PaymentProviderConfig[] {
    return this.configuration.getPaymentProviderConfigs();
  }

  async createIntent(input: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    const providerCode = input.providerCode ?? this.configuration.getActivePaymentProviderCode();
    const provider = this.getEnabledProvider(providerCode);
    const idempotencyKey =
      input.idempotencyKey ??
      `payment-intent:${providerCode}:${input.bookingId}:${input.amount.amount}:${input.amount.currency}`;

    return this.idempotency.runWithKey("payment-intent", idempotencyKey, input, async () => {
      const intent = await provider.createIntent({
        ...input,
        providerCode,
        idempotencyKey,
      });

      return this.repository.saveIntent(intent);
    });
  }

  async capturePayment(input: CapturePaymentRequest): Promise<PaymentResult> {
    const intent = this.repository.findIntent(input.paymentIntentId);

    if (!intent) {
      throw new NotFoundException("Payment intent not found");
    }

    const provider = this.getEnabledProvider(intent.providerCode);
    const idempotencyKey = input.idempotencyKey ?? `payment-capture:${input.paymentIntentId}`;

    return this.idempotency.runWithKey("payment-capture", idempotencyKey, input, async () => {
      const result = await provider.capturePayment(input, intent);
      this.repository.saveIntent({
        ...intent,
        status: result.status,
      });
      this.repository.saveTransaction({
        transactionId: result.transactionId,
        paymentIntentId: result.paymentIntentId,
        providerCode: result.providerCode,
        status: result.status,
        amount: result.amount,
        providerReference: result.providerReference,
        createdAt: result.capturedAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return result;
    });
  }

  listTransactions(): PaymentTransaction[] {
    return this.repository.listTransactions();
  }

  async handleWebhook(
    providerCode: PaymentProviderCode,
    payload: unknown,
    signature?: string,
  ): Promise<PaymentWebhookResult> {
    const provider = this.providers.get(providerCode);
    if (!provider) {
      throw new PaymentProviderUnavailableError(providerCode);
    }
    const verified = await provider.verifyWebhookSignature(payload, signature);
    if (!verified) {
      throw new BadRequestException("Invalid payment webhook signature");
    }
    const parsed = await provider.parseWebhook(payload);
    const duplicate = this.repository.findWebhook(providerCode, parsed.eventId);
    if (duplicate) {
      return {
        accepted: true,
        duplicate: true,
        providerCode,
        eventId: parsed.eventId,
        status: "DUPLICATE",
      };
    }

    const result: PaymentWebhookResult = {
      accepted: true,
      duplicate: false,
      providerCode,
      eventId: parsed.eventId,
      status: "PROCESSED",
    };
    this.repository.recordWebhook(result, parsed.eventType);

    return result;
  }

  private getEnabledProvider(code: PaymentProviderCode): PaymentProvider {
    const provider = this.providers.get(code);
    const config = this.listProviders().find((candidate) => candidate.code === code);

    if (!provider || !config?.enabled) {
      throw new PaymentProviderUnavailableError(code);
    }
    if (code !== "MOCK" && !config.credentialReference) {
      throw new PaymentProviderUnavailableError(code);
    }

    return provider;
  }
}

export { PaymentFailedError, PaymentProviderUnavailableError };
