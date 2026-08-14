import { Injectable } from "@nestjs/common";
import type { AgentProfileRecord } from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

@Injectable()
export class AgentModuleValidator {
  ensureReady(summary: ModuleSummary): void {
    if (summary.status !== "READY_FOR_INTEGRATION") {
      throw new Error("Agent module is not ready for integration");
    }

    if (summary.capabilities.length === 0) {
      throw new Error("Agent module must expose at least one capability");
    }
  }

  ensureActive(profile: AgentProfileRecord): void {
    if (profile.status !== "ACTIVE") {
      throw new Error("Agent profile is not active");
    }
  }
}
