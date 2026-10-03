import { Inject, Injectable, Logger } from "@nestjs/common";

import type { EmailMessage, EmailPort, PreparedEmail } from "./interfaces/email-message.interface";
import { EMAIL_SENDER, type EmailSender } from "./interfaces/email-sender.interface";

/** The templates every outgoing email is rendered from. */
export const EMAIL_TEMPLATES = {
  welcome: {
    subject: "Welcome to Vriddhi Nexus",
    htmlBody: "<p>Welcome {{firstName}}, your Vriddhi Nexus account is ready.</p>",
    textBody: "Welcome {{firstName}}, your Vriddhi Nexus account is ready.",
  },
  "verify-email": {
    subject: "Verify your Vriddhi Nexus email",
    htmlBody: "<p>Use this verification link: {{verificationUrl}}</p>",
    textBody: "Use this verification link: {{verificationUrl}}",
  },
  "verification-email": {
    subject: "Verify your Vriddhi Nexus email",
    htmlBody: "<p>Use this verification link: {{verificationUrl}}</p>",
    textBody: "Use this verification link: {{verificationUrl}}",
  },
  "forgot-password": {
    subject: "Reset your Vriddhi Nexus password",
    htmlBody: "<p>Use this password reset link: {{resetUrl}}</p>",
    textBody: "Use this password reset link: {{resetUrl}}",
  },
  "password-reset": {
    subject: "Reset your Vriddhi Nexus password",
    htmlBody: "<p>Use this password reset link: {{resetUrl}}</p>",
    textBody: "Use this password reset link: {{resetUrl}}",
  },
  "password-changed": {
    subject: "Your Vriddhi Nexus password changed",
    htmlBody: "<p>Your password was changed. Contact support if this was not you.</p>",
    textBody: "Your password was changed. Contact support if this was not you.",
  },
  // The body is the ticket itself, rendered by buildTicketEmail() — a traveller
  // should be able to reach the boarding point on this email alone.
  "booking-confirmation": {
    subject: "{{subject}}",
    htmlBody: "{{ticketHtml}}",
    textBody: "{{ticketText}}",
  },
  "booking-cancelled": {
    subject: "Cancellation requested: {{bookingReference}}",
    htmlBody:
      "<p>We have asked the bus operator to cancel your booking {{bookingReference}}.</p><p>Refund status: {{refundStatus}}</p>",
    textBody:
      "We have asked the bus operator to cancel your booking {{bookingReference}}. Refund status: {{refundStatus}}.",
  },
} as const;

@Injectable()
export class EmailTemplateService implements EmailPort {
  private readonly logger = new Logger(EmailTemplateService.name);

  constructor(@Inject(EMAIL_SENDER) private readonly sender: EmailSender) {}

  prepare(message: EmailMessage): Promise<PreparedEmail> {
    const template = EMAIL_TEMPLATES[message.templateKey];

    return Promise.resolve({
      to: message.to,
      templateKey: message.templateKey,
      subject: this.render(template.subject, message.variables),
      htmlBody: this.render(template.htmlBody, message.variables),
      textBody: this.render(template.textBody, message.variables),
    });
  }

  async queue(message: EmailMessage): Promise<void> {
    const prepared = await this.prepare(message);

    this.logger.log(
      JSON.stringify({
        event: "email.prepared",
        templateKey: message.templateKey,
        toMasked: maskEmail(prepared.to),
      }),
    );

    try {
      const result = await this.sender.send(prepared);

      this.logger.log(
        JSON.stringify({
          event: result.delivered ? "email.sent" : "email.recorded",
          provider: this.sender.provider,
          templateKey: message.templateKey,
          toMasked: maskEmail(prepared.to),
          providerMessageId: result.providerMessageId,
        }),
      );
    } catch (error) {
      // Mail is queued as a side effect of registration, password reset and
      // booking confirmation. A provider outage must not fail those
      // operations, so this is logged and swallowed rather than rethrown.
      this.logger.error(
        JSON.stringify({
          event: "email.failed",
          provider: this.sender.provider,
          templateKey: message.templateKey,
          toMasked: maskEmail(prepared.to),
          reason: error instanceof Error ? error.message : "unknown error",
        }),
      );
    }
  }

  private render(template: string, variables: Record<string, string>): string {
    return Object.entries(variables).reduce(
      (rendered, [key, value]) => rendered.replaceAll(`{{${key}}}`, value),
      template,
    );
  }
}

function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  if (!domain) {
    return "***";
  }

  return `${local.slice(0, 2)}***@${domain}`;
}
