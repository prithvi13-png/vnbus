import { Injectable, Logger } from "@nestjs/common";

import type { PreparedEmail } from "../interfaces/email-message.interface";
import type { EmailSender, EmailSendResult } from "../interfaces/email-sender.interface";

/**
 * Records the message and stops there. Used when EMAIL_PROVIDER is unset or
 * `mock`, so local and CI runs never depend on an outbound mail provider.
 */
@Injectable()
export class MockEmailSender implements EmailSender {
  readonly provider = "mock";
  private readonly logger = new Logger(MockEmailSender.name);

  send(email: PreparedEmail): Promise<EmailSendResult> {
    this.logger.log(
      JSON.stringify({
        event: "email.mock.recorded",
        templateKey: email.templateKey,
        subject: email.subject,
      }),
    );

    return Promise.resolve({ delivered: false });
  }
}
