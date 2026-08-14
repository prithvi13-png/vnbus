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
  private readonly coupons = new Map<string, AdminCouponRecord>(
    seedCoupons().map((coupon) => [coupon.couponId, coupon]),
  );

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

function seedCoupons(): AdminCouponRecord[] {
  const now = "2026-08-08T08:00:00.000Z";

  return [
    coupon("CPN-WELCOME500", "WELCOME500", "FLAT", 500, 5000, 824, 1000, 500, "ACTIVE", now),
    coupon("CPN-AGENT10", "AGENT10", "PERCENTAGE", 10, 2500, 612, 1200, 800, "ACTIVE", now),
    coupon("CPN-FESTIVE15", "FESTIVE15", "PERCENTAGE", 15, 10000, 0, 1500, 1000, "SCHEDULED", now),
  ];
}

function coupon(
  couponId: string,
  code: string,
  type: AdminCouponRecord["type"],
  discountValue: number,
  usageLimit: number,
  usedCount: number,
  minimumBookingAmount: number,
  maximumDiscount: number,
  status: AdminCouponRecord["status"],
  timestamp: string,
): AdminCouponRecord {
  return {
    couponId,
    code,
    type,
    discountValue,
    usageLimit,
    usedCount,
    expiresAt: "2026-12-31T18:29:59.000Z",
    minimumBookingAmount: { amount: minimumBookingAmount, currency: "INR" },
    maximumDiscount: { amount: maximumDiscount, currency: "INR" },
    status,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
