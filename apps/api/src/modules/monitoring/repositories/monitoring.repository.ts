import { Injectable } from "@nestjs/common";
import type { AdminMonitoringResponse, AdminSystemHealthRecord } from "@vnbus/types";

import type { MonitoringQueryDto } from "../dto/monitoring-query.dto";

@Injectable()
export class MonitoringRepository {
  getDashboard(query: MonitoringQueryDto = {}): AdminMonitoringResponse {
    const sampledAt = "2026-08-08T09:00:00.000Z";
    const components = seedComponents(sampledAt).filter(
      (component) =>
        !query.component ||
        component.component.toLowerCase().includes(query.component.toLowerCase()),
    );

    return {
      components,
      cpu: 42,
      memory: 61,
      storage: 37,
      queueDepth: 76,
      sampledAt,
    };
  }
}

function seedComponents(sampledAt: string): AdminSystemHealthRecord[] {
  return [
    component(
      "API Status",
      "HEALTHY",
      42,
      99.98,
      "REST controllers responding normally.",
      sampledAt,
    ),
    component("Database", "HEALTHY", 18, 99.99, "Postgres mock readiness healthy.", sampledAt),
    component("Redis", "DEGRADED", 96, 98.7, "Queue latency elevated in mock snapshot.", sampledAt),
    component("Queue", "HEALTHY", 55, 99.91, "Background jobs are draining.", sampledAt),
    component("Email Queue", "DEGRADED", 88, 99.2, "Retry backlog is above target.", sampledAt),
    component("Storage", "HEALTHY", 25, 99.96, "Ticket artifacts placeholder healthy.", sampledAt),
    component(
      "Memory",
      "HEALTHY",
      0,
      99.95,
      "Memory utilization below alert threshold.",
      sampledAt,
    ),
    component("CPU", "HEALTHY", 0, 99.94, "CPU utilization below alert threshold.", sampledAt),
  ];
}

function component(
  name: string,
  status: AdminSystemHealthRecord["status"],
  latencyMs: number,
  uptimePercentage: number,
  message: string,
  sampledAt: string,
): AdminSystemHealthRecord {
  return {
    component: name,
    status,
    latencyMs,
    uptimePercentage,
    message,
    sampledAt,
  };
}
