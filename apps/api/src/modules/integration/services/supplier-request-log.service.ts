import { Injectable } from "@nestjs/common";
import type { SupplierRequestLogRecord } from "@vnbus/types";

@Injectable()
export class SupplierRequestLogService {
  private readonly logs: SupplierRequestLogRecord[] = [];

  record(log: SupplierRequestLogRecord): SupplierRequestLogRecord {
    this.logs.unshift(log);

    return log;
  }

  list(limit = 100): SupplierRequestLogRecord[] {
    return this.logs.slice(0, limit);
  }

  clear(): void {
    this.logs.splice(0, this.logs.length);
  }
}
