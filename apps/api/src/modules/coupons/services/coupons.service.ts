import { Injectable } from "@nestjs/common";
import type { AdminCouponRecord } from "@vnbus/types";

import type { CreateAdminCouponDto, UpdateAdminCouponDto } from "../dto/admin-coupon.dto";
import { CouponsSummaryDto } from "../dto/coupons-summary.dto";
import type { CouponsModulePort } from "../interfaces/coupons.interface";
import { CouponsRepository } from "../repositories/coupons.repository";
import { CouponsModuleValidator } from "../validators/coupons.validator";

@Injectable()
export class CouponsService implements CouponsModulePort {
  constructor(
    private readonly repository: CouponsRepository,
    private readonly validator: CouponsModuleValidator,
  ) {}

  getSummary(): CouponsSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new CouponsSummaryDto(summary);
  }

  listCoupons(): AdminCouponRecord[] {
    return this.repository.listCoupons();
  }

  createCoupon(dto: CreateAdminCouponDto): AdminCouponRecord {
    return this.repository.createCoupon(dto);
  }

  updateCoupon(couponId: string, dto: UpdateAdminCouponDto): AdminCouponRecord {
    const coupon = this.repository.updateCoupon(couponId, dto);
    this.validator.ensureFound(coupon, "Coupon");

    return coupon;
  }

  toggleCoupon(couponId: string): AdminCouponRecord {
    const coupon = this.repository.toggleCoupon(couponId);
    this.validator.ensureFound(coupon, "Coupon");

    return coupon;
  }
}
