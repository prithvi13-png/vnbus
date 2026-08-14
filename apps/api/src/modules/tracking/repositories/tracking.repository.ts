import { Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "tracking",
  boundedContext: "Journey tracking",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Tracking abstraction",
      description: "Use supplier-neutral trip tracking contracts.",
    },
    {
      name: "OpenStreetMap geometry",
      description: "Prepare latitude and longitude data for OSM rendering.",
    },
    {
      name: "Journey events",
      description: "Model stop, delay, and bus movement events.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class TrackingRepository {
  findSummary(): ModuleSummary {
    return summary;
  }
}
