import type { ModuleSummary } from "../../../shared/domain/module-summary";
import type { AdminCouponRecord } from "@vnbus/types";

export class CouponsContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number,
  ) {}

  static fromSummary(summary: ModuleSummary): CouponsContextEntity {
    return new CouponsContextEntity(
      summary.module,
      summary.boundedContext,
      summary.capabilities.length,
    );
  }
}

export class AdminCouponEntity {
  constructor(readonly coupon: AdminCouponRecord) {}
}
