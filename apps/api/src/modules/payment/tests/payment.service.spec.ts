import type { CreatePaymentIntentRequest } from "@vnbus/types";

import { IdempotencyService } from "../../integration/services/idempotency.service";
import { IntegrationConfigurationService } from "../../integration/services/integration-configuration.service";
import { PaymentRepository } from "../repositories/payment.repository";
import { PaymentProviderUnavailableError, PaymentService } from "../services/payment.service";

describe("PaymentService", () => {
  const createService = (): PaymentService =>
    new PaymentService(
      new PaymentRepository(),
      new IntegrationConfigurationService(),
      new IdempotencyService(),
    );

  it("creates and captures a mock payment intent idempotently", async () => {
    const service = createService();
    const request: CreatePaymentIntentRequest = {
      bookingId: "BKG-1",
      amount: { amount: 1710, currency: "INR" },
      idempotencyKey: "pay-key-1",
    };
    const first = await service.createIntent(request);
    const second = await service.createIntent(request);

    expect(first.paymentIntentId).toBe(second.paymentIntentId);

    const result = await service.capturePayment({
      paymentIntentId: first.paymentIntentId,
      idempotencyKey: "capture-key-1",
    });

    expect(result.status).toBe("CAPTURED");
    expect(service.listTransactions()).toHaveLength(1);
  });

  it("keeps real payment adapters unavailable until configured", async () => {
    const service = createService();

    await expect(
      service.createIntent({
        bookingId: "BKG-2",
        amount: { amount: 1200, currency: "INR" },
        providerCode: "RAZORPAY",
      }),
    ).rejects.toBeInstanceOf(PaymentProviderUnavailableError);
  });

  it("verifies mock webhooks and rejects duplicates", async () => {
    const service = createService();
    const payload = {
      eventId: "evt_1",
      eventType: "payment.captured",
      status: "CAPTURED",
    };
    const first = await service.handleWebhook("MOCK", payload, "mock-signature");
    const second = await service.handleWebhook("MOCK", payload, "mock-signature");

    expect(first).toMatchObject({ accepted: true, duplicate: false, status: "PROCESSED" });
    expect(second).toMatchObject({ accepted: true, duplicate: true, status: "DUPLICATE" });
  });
});
