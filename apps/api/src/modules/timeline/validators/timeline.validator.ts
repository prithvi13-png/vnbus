import { Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";
import type { CreateTimelineEventInput } from "../interfaces/timeline.interface";

@Injectable()
export class TimelineModuleValidator {
  ensureReady(summary: ModuleSummary): void {
    if (summary.status !== "READY_FOR_INTEGRATION") {
      throw new Error("Timeline module is not ready for integration");
    }

    if (summary.capabilities.length === 0) {
      throw new Error("Timeline module must expose at least one capability");
    }
  }

  ensureEvent(input: CreateTimelineEventInput): void {
    if (!input.bookingId.trim()) {
      throw new Error("bookingId is required");
    }
    if (!input.title.trim()) {
      throw new Error("Timeline title is required");
    }
  }
}
