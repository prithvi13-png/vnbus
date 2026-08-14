import type { AdminMonitoringResponse, AdminSystemHealthRecord } from "@vnbus/types";

export class MonitoringSnapshotEntity {
  constructor(readonly snapshot: AdminSystemHealthRecord) {}
}

export class MonitoringDashboardEntity {
  constructor(readonly dashboard: AdminMonitoringResponse) {}
}
