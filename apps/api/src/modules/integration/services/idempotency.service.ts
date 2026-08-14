import { ConflictException, Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";

type IdempotencyStatus = "PROCESSING" | "COMPLETED" | "FAILED";

interface IdempotencyEntry<T = unknown> {
  key: string;
  scope: string;
  fingerprint: string;
  status: IdempotencyStatus;
  response: T | null;
  createdAt: number;
  expiresAt: number;
}

@Injectable()
export class IdempotencyService {
  private readonly entries = new Map<string, IdempotencyEntry>();

  async runWithKey<T>(
    scope: string,
    key: string,
    payload: unknown,
    handler: () => Promise<T>,
    ttlMs = 24 * 60 * 60 * 1000,
  ): Promise<T> {
    this.deleteExpired();
    const scopedKey = `${scope}:${key}`;
    const fingerprint = fingerprintPayload(payload);
    const existing = this.entries.get(scopedKey);

    if (existing) {
      if (existing.fingerprint !== fingerprint) {
        throw new ConflictException("Idempotency key was reused with a different payload");
      }
      if (existing.status === "COMPLETED") {
        return existing.response as T;
      }

      throw new ConflictException("Idempotent operation is already processing");
    }

    this.entries.set(scopedKey, {
      key,
      scope,
      fingerprint,
      status: "PROCESSING",
      response: null,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    });

    try {
      const response = await handler();
      this.entries.set(scopedKey, {
        key,
        scope,
        fingerprint,
        status: "COMPLETED",
        response,
        createdAt: Date.now(),
        expiresAt: Date.now() + ttlMs,
      });

      return response;
    } catch (error) {
      this.entries.set(scopedKey, {
        key,
        scope,
        fingerprint,
        status: "FAILED",
        response: null,
        createdAt: Date.now(),
        expiresAt: Date.now() + ttlMs,
      });
      throw error;
    }
  }

  getStatus(scope: string, key: string): IdempotencyStatus | null {
    this.deleteExpired();

    return this.entries.get(`${scope}:${key}`)?.status ?? null;
  }

  private deleteExpired(): void {
    const now = Date.now();

    for (const [key, entry] of this.entries.entries()) {
      if (entry.expiresAt <= now) {
        this.entries.delete(key);
      }
    }
  }
}

export function fingerprintPayload(payload: unknown): string {
  return createHash("sha256").update(stableStringify(payload)).digest("hex");
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}
