import { Global, Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { EmailLoggerService } from "./email-logger.service";
import { EmailQueueService } from "./email-queue.service";
import { EmailRetryStrategy } from "./email-retry.strategy";
import { EmailTemplateService } from "./email-template.service";
import { EMAIL_SENDER, type EmailSender } from "./interfaces/email-sender.interface";
import { MockEmailSender } from "./senders/mock-email.sender";
import { ResendEmailSender } from "./senders/resend-email.sender";

const emailSenderProvider = {
  provide: EMAIL_SENDER,
  inject: [ConfigService],
  useFactory: (config: ConfigService): EmailSender => {
    const logger = new Logger("EmailSenderFactory");
    const provider = (config.get<string>("EMAIL_PROVIDER") ?? "mock").toLowerCase();

    if (provider !== "resend") {
      return new MockEmailSender();
    }

    const apiKey = config.get<string>("RESEND_API_KEY");
    if (!apiKey) {
      // Falling back rather than throwing keeps the app bootable when an
      // environment asks for Resend before its key is in place. The log is
      // an error because outbound mail is silently off until it is fixed.
      logger.error(
        "EMAIL_PROVIDER=resend but RESEND_API_KEY is not set — falling back to the no-op sender. No email will be delivered.",
      );

      return new MockEmailSender();
    }

    const from = config.get<string>("EMAIL_FROM") ?? "onboarding@resend.dev";

    return new ResendEmailSender(apiKey, from, config);
  },
};

@Global()
@Module({
  providers: [
    emailSenderProvider,
    EmailTemplateService,
    EmailLoggerService,
    EmailRetryStrategy,
    EmailQueueService,
  ],
  exports: [
    EMAIL_SENDER,
    EmailTemplateService,
    EmailLoggerService,
    EmailRetryStrategy,
    EmailQueueService,
  ],
})
export class EmailModule {}
