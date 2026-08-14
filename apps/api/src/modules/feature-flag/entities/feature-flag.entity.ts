import type { AdminFeatureFlagRecord } from "@vnbus/types";

export class FeatureFlagEntity {
  constructor(readonly flag: AdminFeatureFlagRecord) {}
}
