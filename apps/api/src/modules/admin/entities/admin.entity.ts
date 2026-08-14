import type { ModuleSummary } from "../../../shared/domain/module-summary";
import type {
  AdminBookingListResponse,
  AdminDashboardResponse,
  AdminEmailTemplateRecord,
} from "@vnbus/types";

export class AdminContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number,
  ) {}

  static fromSummary(summary: ModuleSummary): AdminContextEntity {
    return new AdminContextEntity(
      summary.module,
      summary.boundedContext,
      summary.capabilities.length,
    );
  }
}

export class AdminDashboardEntity {
  constructor(readonly dashboard: AdminDashboardResponse) {}
}

export class AdminBookingCollectionEntity {
  constructor(readonly collection: AdminBookingListResponse) {}
}

export class AdminEmailTemplateEntity {
  constructor(readonly template: AdminEmailTemplateRecord) {}
}
