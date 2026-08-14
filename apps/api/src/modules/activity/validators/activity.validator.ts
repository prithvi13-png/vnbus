import { Injectable } from "@nestjs/common";

import type { ActivityLogInput } from "../interfaces/activity-log-input.interface";

@Injectable()
export class ActivityValidator {
  ensureValid(input: ActivityLogInput): void {
    if (!input.action.trim()) {
      throw new Error("Activity action is required");
    }

    if (!input.message.trim()) {
      throw new Error("Activity message is required");
    }
  }
}
