import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { AdminOfferRecord } from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { CreateAdminOfferDto, UpdateAdminOfferDto } from "../dto/admin-offer.dto";
import { OffersSummaryDto } from "../dto/offers-summary.dto";
import { OffersService } from "../services/offers.service";

@ApiTags("Offers")
@ApiBearerAuth()
@Controller("offers")
export class OffersController {
  constructor(private readonly service: OffersService) {}

  @Public()
  @Get("health")
  getHealth(): OffersSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("capabilities")
  getCapabilities(): OffersSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get()
  @ApiOkResponse({ description: "Admin offer and promotion records" })
  listOffers(): AdminOfferRecord[] {
    return this.service.listOffers();
  }

  @Roles("ADMIN")
  @Post()
  @ApiOkResponse({ description: "Create offer banner, route, seasonal, home, or popup offer" })
  createOffer(@Body() dto: CreateAdminOfferDto): AdminOfferRecord {
    return this.service.createOffer(dto);
  }

  @Roles("ADMIN")
  @Patch(":offerId")
  @ApiOkResponse({ description: "Update offer campaign metadata" })
  updateOffer(
    @Param("offerId") offerId: string,
    @Body() dto: UpdateAdminOfferDto,
  ): AdminOfferRecord {
    return this.service.updateOffer(offerId, dto);
  }

  @Roles("ADMIN")
  @Post(":offerId/toggle")
  @ApiOkResponse({ description: "Toggle offer active/inactive state" })
  toggleOffer(@Param("offerId") offerId: string): AdminOfferRecord {
    return this.service.toggleOffer(offerId);
  }
}
