import { Injectable } from "@nestjs/common";
import type {
  AdminCouponRecord,
  CreateAdminCouponRequest,
  UpdateAdminCouponRequest,
} from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "coupons",
  boundedContext: "Coupon discounts",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Coupon validation",
      description: "Prepare coupon code eligibility checks.",
    },
    {
      name: "Redemption ledger",
      description: "Track redemption limits and audit trails.",
    },
    {
      name: "Discount rules",
      description: "Model fixed and percentage discount constraints.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class CouponsRepository {
  private readonly coupons = new Map<string, AdminCouponRecord>();

  findSummary(): ModuleSummary {
    return summary;
  }

  listCoupons(): AdminCouponRecord[] {
    return [...this.coupons.values()].sort((left, right) => left.code.localeCompare(right.code));
  }

  createCoupon(input: CreateAdminCouponRequest): AdminCouponRecord {
    const now = new Date().toISOString();
    const coupon: AdminCouponRecord = {
      couponId: `CPN-${input.code.toUpperCase()}`,
      code: input.code.toUpperCase(),
      type: input.type,
      discountValue: input.discountValue,
      usageLimit: input.usageLimit,
      usedCount: 0,
      expiresAt: input.expiresAt,
      minimumBookingAmount: { amount: input.minimumBookingAmount, currency: "INR" },
      maximumDiscount: { amount: input.maximumDiscount, currency: "INR" },
      status: input.status ?? "ACTIVE",
      createdAt: now,
      updatedAt: now,
    };
    this.coupons.set(coupon.couponId, coupon);

    return coupon;
  }

  updateCoupon(couponId: string, input: UpdateAdminCouponRequest): AdminCouponRecord | null {
    const existing = this.findCoupon(couponId);
    if (!existing) {
      return null;
    }

    const updated: AdminCouponRecord = {
      ...existing,
      ...(input.discountValue !== undefined ? { discountValue: input.discountValue } : {}),
      ...(input.usageLimit !== undefined ? { usageLimit: input.usageLimit } : {}),
      ...(input.expiresAt !== undefined ? { expiresAt: input.expiresAt } : {}),
      ...(input.minimumBookingAmount !== undefined
        ? { minimumBookingAmount: { amount: input.minimumBookingAmount, currency: "INR" } }
        : {}),
      ...(input.maximumDiscount !== undefined
        ? { maximumDiscount: { amount: input.maximumDiscount, currency: "INR" } }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      updatedAt: new Date().toISOString(),
    };
    this.coupons.set(updated.couponId, updated);

    return updated;
  }

  toggleCoupon(couponId: string): AdminCouponRecord | null {
    const existing = this.findCoupon(couponId);
    if (!existing) {
      return null;
    }

    return this.updateCoupon(existing.couponId, {
      status: existing.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    });
  }

  findCoupon(couponId: string): AdminCouponRecord | null {
    return (
      this.coupons.get(couponId) ??
      this.listCoupons().find((coupon) => coupon.code === couponId.toUpperCase()) ??
      null
    );
  }
}
