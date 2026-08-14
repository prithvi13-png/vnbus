import { Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "supplier",
  boundedContext: "Supplier integration boundary",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Adapter registry",
      description: "Register supplier adapters without direct third-party coupling.",
    },
    {
      name: "Adapter selection",
      description: "Resolve supplier contracts by code and capability.",
    },
    {
      name: "Integration observability",
      description: "Prepare health, latency, and failure metrics per supplier.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class SupplierRepository {
  findSummary(): ModuleSummary {
    return summary;
  }
}
