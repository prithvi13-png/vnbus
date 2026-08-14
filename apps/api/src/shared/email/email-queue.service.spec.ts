import { EmailLoggerService } from "./email-logger.service";
import { EmailQueueService } from "./email-queue.service";
import { EmailRetryStrategy } from "./email-retry.strategy";
import { EmailTemplateService } from "./email-template.service";

describe("EmailQueueService", () => {
  it("queues, logs, and marks architecture-only emails as sent", async () => {
    const service = new EmailQueueService(
      new EmailTemplateService(),
      new EmailLoggerService(),
      new EmailRetryStrategy(),
    );

    const log = await service.queue({
      to: "traveller@example.com",
      templateKey: "booking-confirmation",
      variables: {
        bookingReference: "VNB-1",
        route: "Bangalore to Hyderabad",
        attachmentFileName: "VNB-1.pdf",
      },
    });

    expect(log.status).toBe("SENT");
    expect(log.attempts).toBe(0);
    expect(service.listLogs()).toHaveLength(1);
  });

  it("calculates retry state without SMTP integration", () => {
    const service = new EmailQueueService(
      new EmailTemplateService(),
      new EmailLoggerService(),
      new EmailRetryStrategy(),
    );

    return service
      .queue({
        to: "traveller@example.com",
        templateKey: "booking-cancelled",
        variables: {
          bookingReference: "VNB-1",
          refundStatus: "Refund Pending",
        },
      })
      .then((log) => {
        const retry = service.retry(log.id);

        expect(retry.status).toBe("RETRY_SCHEDULED");
        expect(retry.nextRetryAt).toBeTruthy();
      });
  });
});
