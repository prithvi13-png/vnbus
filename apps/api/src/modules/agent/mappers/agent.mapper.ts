import { Injectable } from "@nestjs/common";
import type {
  AgentActivityLogRecord,
  AgentDashboardResponse,
  AgentProfileRecord,
} from "@vnbus/types";

import {
  AgentActivityLogEntity,
  AgentDashboardEntity,
  AgentProfileEntity,
} from "../entities/agent.entity";

@Injectable()
export class AgentMapper {
  toProfile(profile: AgentProfileRecord): AgentProfileEntity {
    return new AgentProfileEntity(profile);
  }

  toActivity(activity: AgentActivityLogRecord): AgentActivityLogEntity {
    return new AgentActivityLogEntity(activity);
  }

  toDashboard(dashboard: AgentDashboardResponse): AgentDashboardEntity {
    return new AgentDashboardEntity(dashboard);
  }
}
