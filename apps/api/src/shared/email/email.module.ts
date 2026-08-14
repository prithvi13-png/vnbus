import { Global, Module } from "@nestjs/common";

import { EmailLoggerService } from "./email-logger.service";
import { EmailQueueService } from "./email-queue.service";
import { EmailRetryStrategy } from "./email-retry.strategy";
import { EmailTemplateService } from "./email-template.service";

@Global()
@Module({
  providers: [EmailTemplateService, EmailLoggerService, EmailRetryStrategy, EmailQueueService],
  exports: [EmailTemplateService, EmailLoggerService, EmailRetryStrategy, EmailQueueService],
})
export class EmailModule {}
