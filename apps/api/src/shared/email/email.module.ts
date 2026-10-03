import { Global, Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { EmailLoggerService } from "./email-logger.service";
import { EmailQueueService } from "./email-queue.service";
import { EmailRetryStrategy } from "./email-retry.strategy";
import { EmailTemplateService } from "./email-template.service";
import { EMAIL_SENDER, type EmailSender } from "./interfaces/email-sender.interface";
import { ResendEmailSender } from "./senders/resend-email.sender";
import { UnconfiguredEmailSender } from "./senders/unconfigured-email.sender";

const emailSenderProvider = {
  provide: EMAIL_SENDER,
  inject: [ConfigService],
  useFactory: (config: ConfigService): EmailSender => {
    const logger = new Logger("EmailSenderFactory");
    const provider = (config.get<string>("EMAIL_PROVIDER") ?? "resend").toLowerCase();

    if (provider !== "resend") {
      logger.error(
        `EMAIL_PROVIDER=${provider} is not a supported provider. No email will be delivered.`,
      );

      return new UnconfiguredEmailSender();
    }

    const apiKey = config.get<string>("RESEND_API_KEY");
    if (!apiKey) {
      // Falling back rather than throwing keeps the app bootable when an
      // environment asks for Resend before its key is in place. The log is
      // an error because outbound mail is silently off until it is fixed.
      logger.error("RESEND_API_KEY is not set, so no email will be delivered until it is.");

      return new UnconfiguredEmailSender();
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
