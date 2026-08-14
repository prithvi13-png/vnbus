import { Injectable } from "@nestjs/common";
import type { AdminMonitoringResponse } from "@vnbus/types";

@Injectable()
export class MonitoringValidator {
  ensureHasComponents(response: AdminMonitoringResponse): void {
    if (response.components.length === 0) {
      throw new Error("Monitoring dashboard must contain at least one component");
    }
  }
}
