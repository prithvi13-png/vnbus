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
  private readonly offers = new Map<string, AdminOfferRecord>(
    seedOffers().map((offer) => [offer.offerId, offer]),
  );

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

function seedOffers(): AdminOfferRecord[] {
  return [
    offer(
      "OFR-BANNER-001",
      "Monsoon routes",
      "OFFER_BANNER",
      "Bangalore to Hyderabad",
      "ACTIVE",
      1,
      18420,
      842,
    ),
    offer(
      "OFR-FEATURED-001",
      "Featured Pune to Goa",
      "FEATURED_ROUTES",
      "Pune to Goa",
      "ACTIVE",
      2,
      12980,
      514,
    ),
    offer("OFR-SEASONAL-001", "Festival travel saver", "SEASONAL", null, "SCHEDULED", 4, 0, 0),
    offer(
      "OFR-HOME-001",
      "Home promotion",
      "HOME_PROMOTION",
      "Chennai to Coimbatore",
      "DRAFT",
      8,
      0,
      0,
    ),
    offer("OFR-POPUP-001", "App install popup", "POPUP", null, "INACTIVE", 12, 6200, 91),
  ];
}

function offer(
  offerId: string,
  title: string,
  placement: AdminOfferRecord["placement"],
  route: string | null,
  status: AdminOfferRecord["status"],
  priority: number,
  impressions: number,
  conversions: number,
): AdminOfferRecord {
  return {
    offerId,
    title,
    placement,
    route,
    status,
    startsAt: "2026-08-08T00:00:00.000Z",
    endsAt: "2026-09-30T18:29:59.000Z",
    priority,
    impressions,
    conversions,
  };
}
