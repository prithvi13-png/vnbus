import type {
  AgentActivityLogRecord,
  AgentDashboardResponse,
  AgentProfileRecord,
} from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

export class AgentContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number,
  ) {}

  static fromSummary(summary: ModuleSummary): AgentContextEntity {
    return new AgentContextEntity(
      summary.module,
      summary.boundedContext,
      summary.capabilities.length,
    );
  }
}

export class AgentProfileEntity implements AgentProfileRecord {
  readonly agentId!: AgentProfileRecord["agentId"];
  readonly agencyName!: AgentProfileRecord["agencyName"];
  readonly agencyAddress!: AgentProfileRecord["agencyAddress"];
  readonly contactName!: AgentProfileRecord["contactName"];
  readonly email!: AgentProfileRecord["email"];
  readonly phone!: AgentProfileRecord["phone"];
  readonly logoUrl!: AgentProfileRecord["logoUrl"];
  readonly status!: AgentProfileRecord["status"];
  readonly commissionRate!: AgentProfileRecord["commissionRate"];
  readonly emailPreferences!: AgentProfileRecord["emailPreferences"];
  readonly notificationPreferences!: AgentProfileRecord["notificationPreferences"];

  constructor(profile: AgentProfileRecord) {
    Object.assign(this, profile);
  }
}

export class AgentActivityLogEntity implements AgentActivityLogRecord {
  readonly id!: AgentActivityLogRecord["id"];
  readonly type!: AgentActivityLogRecord["type"];
  readonly title!: AgentActivityLogRecord["title"];
  readonly description!: AgentActivityLogRecord["description"];
  readonly occurredAt!: AgentActivityLogRecord["occurredAt"];
  readonly actor!: AgentActivityLogRecord["actor"];

  constructor(activity: AgentActivityLogRecord) {
    Object.assign(this, activity);
  }
}

export class AgentDashboardEntity implements AgentDashboardResponse {
  readonly profile!: AgentDashboardResponse["profile"];
  readonly metrics!: AgentDashboardResponse["metrics"];
  readonly recentCustomers!: AgentDashboardResponse["recentCustomers"];
  readonly recentActivity!: AgentDashboardResponse["recentActivity"];
  readonly quickBookingRoutes!: AgentDashboardResponse["quickBookingRoutes"];
  readonly popularRoutes!: AgentDashboardResponse["popularRoutes"];
  readonly bookingStatusSummary!: AgentDashboardResponse["bookingStatusSummary"];
  readonly notifications!: AgentDashboardResponse["notifications"];

  constructor(dashboard: AgentDashboardResponse) {
    Object.assign(this, dashboard);
  }
}
