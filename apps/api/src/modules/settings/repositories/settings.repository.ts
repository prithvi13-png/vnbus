import { Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "settings",
  boundedContext: "Enterprise configuration",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Organization settings",
      description: "Manage brand, contact, and booking policy records.",
    },
    {
      name: "Feature flags",
      description: "Prepare progressive rollout controls.",
    },
    {
      name: "Secret references",
      description: "Store references to managed secrets rather than raw secret values.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class SettingsRepository {
  findSummary(): ModuleSummary {
    return summary;
  }
}
