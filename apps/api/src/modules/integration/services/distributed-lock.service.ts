import { ConflictException, Injectable } from "@nestjs/common";

interface LockRecord {
  key: string;
  owner: string;
  expiresAt: number;
}

@Injectable()
export class DistributedLockService {
  private readonly locks = new Map<string, LockRecord>();

  acquire(key: string, owner: string, ttlMs: number): LockRecord | null {
    this.deleteExpired();
    const existing = this.locks.get(key);

    if (existing && existing.expiresAt > Date.now()) {
      return null;
    }

    const lock = {
      key,
      owner,
      expiresAt: Date.now() + ttlMs,
    };
    this.locks.set(key, lock);

    return lock;
  }

  release(key: string, owner: string): boolean {
    const lock = this.locks.get(key);

    if (!lock || lock.owner !== owner) {
      return false;
    }

    this.locks.delete(key);

    return true;
  }

  async withLock<T>(
    key: string,
    owner: string,
    ttlMs: number,
    handler: () => Promise<T>,
  ): Promise<T> {
    const lock = this.acquire(key, owner, ttlMs);

    if (!lock) {
      throw new ConflictException("Operation is locked by another request");
    }

    try {
      return await handler();
    } finally {
      this.release(key, owner);
    }
  }

  private deleteExpired(): void {
    const now = Date.now();

    for (const [key, lock] of this.locks.entries()) {
      if (lock.expiresAt <= now) {
        this.locks.delete(key);
      }
    }
  }
}
