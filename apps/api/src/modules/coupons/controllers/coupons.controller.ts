import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { AdminCouponRecord } from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { CreateAdminCouponDto, UpdateAdminCouponDto } from "../dto/admin-coupon.dto";
import { CouponsSummaryDto } from "../dto/coupons-summary.dto";
import { CouponsService } from "../services/coupons.service";

@ApiTags("Coupons")
@ApiBearerAuth()
@Controller("coupons")
export class CouponsController {
  constructor(private readonly service: CouponsService) {}

  @Public()
  @Get("health")
  getHealth(): CouponsSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("capabilities")
  getCapabilities(): CouponsSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get()
  @ApiOkResponse({ description: "Admin coupon management list" })
  listCoupons(): AdminCouponRecord[] {
    return this.service.listCoupons();
  }

  @Roles("ADMIN")
  @Post()
  @ApiOkResponse({ description: "Create percentage or flat coupon" })
  createCoupon(@Body() dto: CreateAdminCouponDto): AdminCouponRecord {
    return this.service.createCoupon(dto);
  }

  @Roles("ADMIN")
  @Patch(":couponId")
  @ApiOkResponse({ description: "Update coupon rules" })
  updateCoupon(
    @Param("couponId") couponId: string,
    @Body() dto: UpdateAdminCouponDto,
  ): AdminCouponRecord {
    return this.service.updateCoupon(couponId, dto);
  }

  @Roles("ADMIN")
  @Post(":couponId/toggle")
  @ApiOkResponse({ description: "Toggle coupon active/inactive state" })
  toggleCoupon(@Param("couponId") couponId: string): AdminCouponRecord {
    return this.service.toggleCoupon(couponId);
  }
}
