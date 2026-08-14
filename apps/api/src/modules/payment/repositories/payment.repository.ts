import { Injectable } from "@nestjs/common";
import type {
  PaymentIntent,
  PaymentTransaction,
  PaymentWebhook,
  PaymentWebhookResult,
} from "@vnbus/types";

@Injectable()
export class PaymentRepository {
  private readonly intents = new Map<string, PaymentIntent>();
  private readonly transactions = new Map<string, PaymentTransaction>();
  private readonly webhooks = new Map<string, PaymentWebhook>();

  saveIntent(intent: PaymentIntent): PaymentIntent {
    this.intents.set(intent.paymentIntentId, intent);

    return intent;
  }

  findIntent(paymentIntentId: string): PaymentIntent | null {
    return this.intents.get(paymentIntentId) ?? null;
  }

  saveTransaction(transaction: PaymentTransaction): PaymentTransaction {
    this.transactions.set(transaction.transactionId, transaction);

    return transaction;
  }

  listTransactions(): PaymentTransaction[] {
    return [...this.transactions.values()];
  }

  recordWebhook(result: PaymentWebhookResult, eventType: string): PaymentWebhook {
    const webhook: PaymentWebhook = {
      webhookId: `PWH-${Date.now().toString(36).toUpperCase()}`,
      providerCode: result.providerCode,
      eventId: result.eventId,
      eventType,
      receivedAt: new Date().toISOString(),
      processedAt: result.status === "PROCESSED" ? new Date().toISOString() : null,
      status: result.status,
    };
    this.webhooks.set(`${result.providerCode}:${result.eventId}`, webhook);

    return webhook;
  }

  findWebhook(providerCode: string, eventId: string): PaymentWebhook | null {
    return this.webhooks.get(`${providerCode}:${eventId}`) ?? null;
  }
}
