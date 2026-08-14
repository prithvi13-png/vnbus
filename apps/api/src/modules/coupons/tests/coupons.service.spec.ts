import { CouponsRepository } from "../repositories/coupons.repository";
import { CouponsService } from "../services/coupons.service";
import { CouponsModuleValidator } from "../validators/coupons.validator";

describe("CouponsService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new CouponsService(new CouponsRepository(), new CouponsModuleValidator());
    const summary = service.getSummary();

    expect(summary.module).toBe("coupons");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("creates, updates, and toggles coupons", () => {
    const service = new CouponsService(new CouponsRepository(), new CouponsModuleValidator());
    const coupon = service.createCoupon({
      code: "TEST100",
      type: "FLAT",
      discountValue: 100,
      usageLimit: 50,
      expiresAt: "2026-12-31T18:29:59.000Z",
      minimumBookingAmount: 500,
      maximumDiscount: 100,
    });
    const updated = service.updateCoupon(coupon.couponId, { usageLimit: 75 });
    const toggled = service.toggleCoupon(coupon.couponId);

    expect(updated.usageLimit).toBe(75);
    expect(toggled.status).toBe("INACTIVE");
    expect(service.listCoupons().map((item) => item.code)).toContain("TEST100");
  });
});
