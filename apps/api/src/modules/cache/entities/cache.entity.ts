import type { CacheDashboardResponse, CacheEntryRecord } from "@vnbus/types";

export class CacheEntryEntity implements CacheEntryRecord {
  constructor(private readonly record: CacheEntryRecord) {}

  get key(): string {
    return this.record.key;
  }

  get namespace(): CacheEntryRecord["namespace"] {
    return this.record.namespace;
  }

  get status(): CacheEntryRecord["status"] {
    return this.record.status;
  }

  get ttlSeconds(): number {
    return this.record.ttlSeconds;
  }

  get sizeBytes(): number {
    return this.record.sizeBytes;
  }

  get lastAccessedAt(): string {
    return this.record.lastAccessedAt;
  }
}

export class CacheDashboardEntity implements CacheDashboardResponse {
  constructor(private readonly record: CacheDashboardResponse) {}

  get provider(): CacheDashboardResponse["provider"] {
    return this.record.provider;
  }

  get status(): CacheDashboardResponse["status"] {
    return this.record.status;
  }

  get hitRate(): number {
    return this.record.hitRate;
  }

  get entries(): CacheDashboardResponse["entries"] {
    return this.record.entries;
  }

  get warmedNamespaces(): CacheDashboardResponse["warmedNamespaces"] {
    return this.record.warmedNamespaces;
  }

  get strategy(): CacheDashboardResponse["strategy"] {
    return this.record.strategy;
  }
}
