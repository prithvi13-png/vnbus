import { Injectable } from "@nestjs/common";
import type { EmailLogRecord, EmailQueueRecord } from "@vnbus/types";

import { EmailLoggerService } from "./email-logger.service";
import { EmailRetryStrategy } from "./email-retry.strategy";
import { EmailTemplateService } from "./email-template.service";
import type { EmailMessage } from "./interfaces/email-message.interface";

@Injectable()
export class EmailQueueService {
  constructor(
    private readonly templates: EmailTemplateService,
    private readonly logs: EmailLoggerService,
    private readonly retryStrategy: EmailRetryStrategy,
  ) {}

  async queue(message: EmailMessage): Promise<EmailLogRecord> {
    const prepared = await this.templates.prepare(message);
    const queuedAt = new Date().toISOString();
    const record: EmailQueueRecord = {
      id: createEmailLogId(message.to, message.templateKey, queuedAt),
      to: prepared.to,
      templateKey: message.templateKey,
      subject: prepared.subject,
      htmlBody: prepared.htmlBody,
      ...(prepared.textBody ? { textBody: prepared.textBody } : {}),
      status: "QUEUED",
      attempts: 0,
      maxAttempts: this.retryStrategy.maxAttempts,
      queuedAt,
      sentAt: null,
      failedAt: null,
      nextRetryAt: null,
      errorMessage: null,
    };

    this.logs.create(record);

    return this.logs.markSent(record.id, queuedAt);
  }

  retry(emailLogId: string): EmailLogRecord {
    const log = this.logs.find(emailLogId);
    if (!log) {
      throw new Error("Email log not found");
    }

    return this.logs.markFailed(
      emailLogId,
      "Retry scheduled by mock email architecture",
      this.retryStrategy.getNextRetryAt(log.attempts + 1),
    );
  }

  listLogs(): EmailLogRecord[] {
    return this.logs.list();
  }
}

function createEmailLogId(to: string, templateKey: string, queuedAt: string): string {
  const hash = [...`${to}|${templateKey}|${queuedAt}`].reduce(
    (value, char) => (value * 31 + char.charCodeAt(0)) >>> 0,
    2166136261,
  );

  return `EML-${hash.toString(36).toUpperCase().padStart(8, "0").slice(0, 8)}`;
}
