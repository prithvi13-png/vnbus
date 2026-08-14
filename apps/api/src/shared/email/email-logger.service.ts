import { Injectable, Logger } from "@nestjs/common";
import type { EmailLogRecord, EmailQueueRecord } from "@vnbus/types";

@Injectable()
export class EmailLoggerService {
  private readonly logger = new Logger(EmailLoggerService.name);
  private readonly logs = new Map<string, EmailQueueRecord>();

  create(record: EmailQueueRecord): EmailQueueRecord {
    this.logs.set(record.id, record);
    this.logger.log(
      JSON.stringify({
        event: "email.queued",
        emailLogId: record.id,
        templateKey: record.templateKey,
        toMasked: maskEmail(record.to),
      }),
    );

    return record;
  }

  markSent(emailLogId: string, sentAt = new Date().toISOString()): EmailLogRecord {
    const current = this.findOrThrow(emailLogId);
    const updated: EmailQueueRecord = {
      ...current,
      status: "SENT",
      sentAt,
      failedAt: null,
      nextRetryAt: null,
      errorMessage: null,
    };

    this.logs.set(emailLogId, updated);
    this.logger.log(JSON.stringify({ event: "email.sent", emailLogId }));

    return toPublicLog(updated);
  }

  markFailed(emailLogId: string, errorMessage: string, nextRetryAt: string | null): EmailLogRecord {
    const current = this.findOrThrow(emailLogId);
    const updated: EmailQueueRecord = {
      ...current,
      status: nextRetryAt ? "RETRY_SCHEDULED" : "FAILED",
      attempts: current.attempts + 1,
      failedAt: new Date().toISOString(),
      nextRetryAt,
      errorMessage,
    };

    this.logs.set(emailLogId, updated);
    this.logger.warn(JSON.stringify({ event: "email.failed", emailLogId, nextRetryAt }));

    return toPublicLog(updated);
  }

  list(): EmailLogRecord[] {
    return [...this.logs.values()]
      .sort((left, right) => Date.parse(right.queuedAt) - Date.parse(left.queuedAt))
      .map(toPublicLog);
  }

  find(emailLogId: string): EmailLogRecord | null {
    const record = this.logs.get(emailLogId);

    return record ? toPublicLog(record) : null;
  }

  private findOrThrow(emailLogId: string): EmailQueueRecord {
    const record = this.logs.get(emailLogId);
    if (!record) {
      throw new Error("Email log not found");
    }

    return record;
  }
}

function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  if (!domain) {
    return "***";
  }

  return `${local.slice(0, 2)}***@${domain}`;
}

function toPublicLog(record: EmailQueueRecord): EmailLogRecord {
  const { htmlBody, textBody, ...log } = record;
  void htmlBody;
  void textBody;

  return log;
}
