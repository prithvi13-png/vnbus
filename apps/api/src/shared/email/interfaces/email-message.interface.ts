export type EmailTemplateKey =
  | "welcome"
  | "verification-email"
  | "verify-email"
  | "password-reset"
  | "forgot-password"
  | "password-changed"
  | "booking-confirmation"
  | "booking-cancelled"
  | "booking-rescheduled";

export interface EmailMessage {
  to: string;
  templateKey: EmailTemplateKey;
  variables: Record<string, string>;
}

export interface PreparedEmail {
  to: string;
  templateKey?: EmailTemplateKey;
  subject: string;
  htmlBody: string;
  textBody?: string;
}

export interface EmailPort {
  prepare(message: EmailMessage): Promise<PreparedEmail>;
  queue(message: EmailMessage): Promise<void>;
}
