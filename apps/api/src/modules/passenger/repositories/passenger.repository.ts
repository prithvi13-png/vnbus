import { Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "passenger",
  boundedContext: "Passenger validation and manifest",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Passenger manifest",
      description: "Normalize passenger names, age, gender, contact data, and seat assignment.",
    },
    {
      name: "Validation boundary",
      description: "Keep passenger validation separate from supplier-specific booking payloads.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class PassengerRepository {
  findSummary(): ModuleSummary {
    return summary;
  }
}
