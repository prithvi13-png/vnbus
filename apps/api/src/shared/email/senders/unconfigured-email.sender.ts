import { Injectable, Logger } from "@nestjs/common";

import type { PreparedEmail } from "../interfaces/email-message.interface";
import type { EmailSender, EmailSendResult } from "../interfaces/email-sender.interface";

/**
 * Used when no mail provider is configured. Nothing is delivered, and every
 * message says so in the log rather than pretending it went out.
 */
@Injectable()
export class UnconfiguredEmailSender implements EmailSender {
  readonly provider = "none";
  private readonly logger = new Logger(UnconfiguredEmailSender.name);

  send(email: PreparedEmail): Promise<EmailSendResult> {
    this.logger.warn(
      JSON.stringify({
        event: "email.not_delivered",
        reason: "No email provider is configured (set EMAIL_PROVIDER=resend and RESEND_API_KEY).",
        templateKey: email.templateKey,
        subject: email.subject,
      }),
    );

    return Promise.resolve({ delivered: false });
  }
}
