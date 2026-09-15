import type { PreparedEmail } from "./email-message.interface";

export const EMAIL_SENDER = Symbol("EMAIL_SENDER");

export interface EmailSendResult {
  /** False when the message was only recorded locally rather than handed to a provider. */
  delivered: boolean;
  providerMessageId?: string;
}

export interface EmailSender {
  readonly provider: string;
  send(email: PreparedEmail): Promise<EmailSendResult>;
}
