import { BadRequestException } from "@nestjs/common";

import { testConfig } from "../../../shared/tests/booking-harness";
import { IdempotencyService } from "../../integration/services/idempotency.service";
import { IntegrationConfigurationService } from "../../integration/services/integration-configuration.service";
import { PaymentRepository } from "../repositories/payment.repository";
import { PaymentProviderUnavailableError, PaymentService } from "../services/payment.service";

describe("PaymentService", () => {
  const createService = (settings: Record<string, string> = {}): PaymentService =>
    new PaymentService(
      new PaymentRepository(),
      new IntegrationConfigurationService(testConfig(settings)),
      new IdempotencyService(),
    );

  it("refuses to take payment when no gateway is configured", async () => {
    const service = createService();

    expect(service.listProviders().every((provider) => !provider.enabled)).toBe(true);
    await expect(
      service.createIntent({ bookingId: "booking-1", amount: { amount: 1200, currency: "INR" } }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("keeps placeholder gateways unavailable even when one is selected", async () => {
    const service = createService({ PAYMENT_PROVIDER: "RAZORPAY" });

    expect(service.listProviders().find((provider) => provider.code === "RAZORPAY")?.enabled).toBe(
      true,
    );
    await expect(
      service.createIntent({
        bookingId: "booking-2",
        amount: { amount: 1200, currency: "INR" },
        providerCode: "RAZORPAY",
      }),
    ).rejects.toBeInstanceOf(PaymentProviderUnavailableError);
  });

  it("rejects webhooks no gateway can verify", async () => {
    const service = createService();

    await expect(
      service.handleWebhook("RAZORPAY", { eventId: "evt_1" }, "signature"),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
