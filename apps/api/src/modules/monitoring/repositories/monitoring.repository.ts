import { cpus, freemem, loadavg, totalmem } from "node:os";

import { Injectable } from "@nestjs/common";
import type { AdminMonitoringResponse, AdminSystemHealthRecord } from "@vnbus/types";

import { EmailLoggerService } from "../../../shared/email/email-logger.service";
import { HealthService } from "../../health/services/health.service";
import type { MonitoringQueryDto } from "../dto/monitoring-query.dto";

/** Live readings from this API process and its host, taken on each request. */
@Injectable()
export class MonitoringRepository {
  constructor(
    private readonly health: HealthService,
    private readonly emailLogger: EmailLoggerService,
  ) {}

  getDashboard(query: MonitoringQueryDto = {}): AdminMonitoringResponse {
    const report = this.health.getHealth();
    const components = report.components
      .map((component): AdminSystemHealthRecord => ({
        component: component.component,
        status: component.status,
        latencyMs: component.latencyMs,
        // No uptime history is collected, so none is claimed.
        uptimePercentage: 0,
        message: component.message,
        sampledAt: report.checkedAt,
      }))
      .filter(
        (component) =>
          !query.component ||
          component.component.toLowerCase().includes(query.component.toLowerCase()),
      );

    return {
      components,
      // One-minute load average across all cores, as a percentage.
      cpu: Math.min(100, Math.round(((loadavg()[0] ?? 0) / Math.max(cpus().length, 1)) * 100)),
      memory: Math.round((1 - freemem() / totalmem()) * 100),
      // Disk usage is not measured.
      storage: 0,
      queueDepth: this.emailLogger.list().filter((log) => log.status === "QUEUED").length,
      sampledAt: report.checkedAt,
    };
  }
}
