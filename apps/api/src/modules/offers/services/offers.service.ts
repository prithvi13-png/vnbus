import { Injectable } from "@nestjs/common";
import type { AdminOfferRecord } from "@vnbus/types";

import type { CreateAdminOfferDto, UpdateAdminOfferDto } from "../dto/admin-offer.dto";
import { OffersSummaryDto } from "../dto/offers-summary.dto";
import type { OffersModulePort } from "../interfaces/offers.interface";
import { OffersRepository } from "../repositories/offers.repository";
import { OffersModuleValidator } from "../validators/offers.validator";

@Injectable()
export class OffersService implements OffersModulePort {
  constructor(
    private readonly repository: OffersRepository,
    private readonly validator: OffersModuleValidator,
  ) {}

  getSummary(): OffersSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new OffersSummaryDto(summary);
  }

  listOffers(): AdminOfferRecord[] {
    return this.repository.listOffers();
  }

  createOffer(dto: CreateAdminOfferDto): AdminOfferRecord {
    return this.repository.createOffer(dto);
  }

  updateOffer(offerId: string, dto: UpdateAdminOfferDto): AdminOfferRecord {
    const offer = this.repository.updateOffer(offerId, dto);
    this.validator.ensureFound(offer, "Offer");

    return offer;
  }

  toggleOffer(offerId: string): AdminOfferRecord {
    const offer = this.repository.toggleOffer(offerId);
    this.validator.ensureFound(offer, "Offer");

    return offer;
  }
}
