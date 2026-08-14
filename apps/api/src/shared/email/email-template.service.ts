import { Injectable, Logger } from "@nestjs/common";

import type { EmailMessage, EmailPort, PreparedEmail } from "./interfaces/email-message.interface";

const templates = {
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
  "booking-confirmation": {
    subject: "Booking confirmed: {{bookingReference}}",
    htmlBody:
      "<p>Your booking {{bookingReference}} is confirmed for {{route}}.</p><p>Ticket attachment prepared: {{attachmentFileName}}</p>",
    textBody:
      "Your booking {{bookingReference}} is confirmed for {{route}}. Ticket attachment prepared: {{attachmentFileName}}.",
  },
  "booking-cancelled": {
    subject: "Booking cancelled: {{bookingReference}}",
    htmlBody:
      "<p>Your booking {{bookingReference}} has been cancelled.</p><p>Refund status: {{refundStatus}}</p>",
    textBody:
      "Your booking {{bookingReference}} has been cancelled. Refund status: {{refundStatus}}.",
  },
  "booking-rescheduled": {
    subject: "Booking rescheduled: {{bookingReference}}",
    htmlBody: "<p>Your booking {{bookingReference}} has been rescheduled to {{journeyDate}}.</p>",
    textBody: "Your booking {{bookingReference}} has been rescheduled to {{journeyDate}}.",
  },
} as const;

@Injectable()
export class EmailTemplateService implements EmailPort {
  private readonly logger = new Logger(EmailTemplateService.name);

  prepare(message: EmailMessage): Promise<PreparedEmail> {
    const template = templates[message.templateKey];

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
