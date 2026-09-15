import { Injectable, Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";

import type { PreparedEmail } from "../interfaces/email-message.interface";
import type { EmailSender, EmailSendResult } from "../interfaces/email-sender.interface";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Resend's shared sandbox sender only delivers to the account owner's own address. */
const SANDBOX_FROM = "onboarding@resend.dev";

interface ResendSuccess {
  id: string;
}

/**
 * Talks to Resend's REST API directly rather than pulling in the SDK — the
 * whole integration is one POST, and the monorepo keeps its dependency
 * surface small. Node 22 (see engines) provides fetch globally.
 */
@Injectable()
export class ResendEmailSender implements EmailSender {
  readonly provider = "resend";
  private readonly logger = new Logger(ResendEmailSender.name);
  private warnedAboutSandbox = false;

  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly config: ConfigService,
  ) {}

  async send(email: PreparedEmail): Promise<EmailSendResult> {
    if (this.from === SANDBOX_FROM && !this.warnedAboutSandbox) {
      this.warnedAboutSandbox = true;
      this.logger.warn(
        `EMAIL_FROM is Resend's sandbox sender (${SANDBOX_FROM}), which only delivers to the ` +
          "Resend account owner. Verify vriddhinexus.com in Resend and set EMAIL_FROM to an " +
          "address on that domain before relying on customer email.",
      );
    }

    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: [email.to],
        subject: email.subject,
        html: email.htmlBody,
        ...(email.textBody ? { text: email.textBody } : {}),
      }),
      signal: AbortSignal.timeout(this.config.get<number>("EMAIL_SEND_TIMEOUT_MS") ?? 10_000),
    });

    if (!response.ok) {
      // Surface the provider's own message; it is the only thing that
      // distinguishes a bad key from an unverified domain.
      const detail = await response.text().catch(() => "");
      throw new Error(`Resend rejected the message (${response.status}): ${detail.slice(0, 300)}`);
    }

    const payload = (await response.json()) as Partial<ResendSuccess>;

    // exactOptionalPropertyTypes: only set the key when the provider returned one.
    return payload.id ? { delivered: true, providerMessageId: payload.id } : { delivered: true };
  }
}
