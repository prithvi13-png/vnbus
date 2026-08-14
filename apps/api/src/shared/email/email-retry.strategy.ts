import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailRetryStrategy {
  readonly maxAttempts = 3;

  getNextRetryAt(attempt: number, now = new Date()): string | null {
    if (attempt >= this.maxAttempts) {
      return null;
    }

    const delayMinutes = Math.pow(2, attempt) * 5;
    const retryAt = new Date(now.getTime() + delayMinutes * 60_000);

    return retryAt.toISOString();
  }
}
