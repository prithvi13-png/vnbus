import { Injectable } from "@nestjs/common";
import type {
  AdminOfferRecord,
  CreateAdminOfferRequest,
  UpdateAdminOfferRequest,
} from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "offers",
  boundedContext: "Offer campaigns",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Campaign lifecycle",
      description: "Prepare offer publication windows and targeting.",
    },
    {
      name: "Eligibility rules",
      description: "Model audience, route, and channel eligibility.",
    },
    {
      name: "Merchandising surfaces",
      description: "Expose offers to search and checkout surfaces.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class OffersRepository {
  private readonly offers = new Map<string, AdminOfferRecord>();

  findSummary(): ModuleSummary {
    return summary;
  }

  listOffers(): AdminOfferRecord[] {
    return [...this.offers.values()].sort((left, right) => left.priority - right.priority);
  }

  createOffer(input: CreateAdminOfferRequest): AdminOfferRecord {
    const now = new Date().toISOString();
    const offer: AdminOfferRecord = {
      offerId: `OFR-${now.replaceAll(/[^0-9]/gu, "").slice(0, 14)}`,
      title: input.title,
      placement: input.placement,
      route: input.route ?? null,
      status: input.status ?? "DRAFT",
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      priority: input.priority ?? 50,
      impressions: 0,
      conversions: 0,
    };
    this.offers.set(offer.offerId, offer);

    return offer;
  }

  updateOffer(offerId: string, input: UpdateAdminOfferRequest): AdminOfferRecord | null {
    const existing = this.findOffer(offerId);
    if (!existing) {
      return null;
    }

    const updated: AdminOfferRecord = {
      ...existing,
      ...input,
      route: input.route === undefined ? existing.route : input.route,
    };
    this.offers.set(updated.offerId, updated);

    return updated;
  }

  toggleOffer(offerId: string): AdminOfferRecord | null {
    const existing = this.findOffer(offerId);
    if (!existing) {
      return null;
    }

    return this.updateOffer(existing.offerId, {
      status: existing.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    });
  }

  findOffer(offerId: string): AdminOfferRecord | null {
    return this.offers.get(offerId) ?? null;
  }
}
