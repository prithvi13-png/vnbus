import { EmailLoggerService } from "./email-logger.service";
import { EmailQueueService } from "./email-queue.service";
import { EmailRetryStrategy } from "./email-retry.strategy";
import { EmailTemplateService } from "./email-template.service";
import type { EmailSender } from "./interfaces/email-sender.interface";
import { UnconfiguredEmailSender } from "./senders/unconfigured-email.sender";

/** Stands in for a provider that accepts every message. */
const deliveringSender: EmailSender = {
  provider: "test",
  send: () => Promise.resolve({ delivered: true, providerMessageId: "msg-1" }),
};

describe("EmailQueueService", () => {
  it("queues, logs, and marks delivered emails as sent", async () => {
    const service = new EmailQueueService(
      new EmailTemplateService(deliveringSender),
      new EmailLoggerService(),
      new EmailRetryStrategy(),
    );

    const log = await service.queue({
      to: "traveller@test.invalid",
      templateKey: "booking-cancelled",
      variables: { bookingReference: "VNB-1", refundStatus: "Refund pending" },
    });

    expect(log.status).toBe("SENT");
    expect(log.attempts).toBe(0);
    expect(service.listLogs()).toHaveLength(1);
  });

  it("delivers nothing, and logs why, when no provider is configured", async () => {
    const sender = new UnconfiguredEmailSender();

    await expect(
      sender.send({ to: "traveller@test.invalid", subject: "Hello", htmlBody: "<p>Hi</p>" }),
    ).resolves.toEqual({ delivered: false });
  });

  it("calculates retry state", async () => {
    const service = new EmailQueueService(
      new EmailTemplateService(deliveringSender),
      new EmailLoggerService(),
      new EmailRetryStrategy(),
    );

    const log = await service.queue({
      to: "traveller@test.invalid",
      templateKey: "booking-cancelled",
      variables: { bookingReference: "VNB-1", refundStatus: "Refund pending" },
    });
    const retry = service.retry(log.id);

    expect(retry.status).toBe("RETRY_SCHEDULED");
    expect(retry.nextRetryAt).toBeTruthy();
  });
});
