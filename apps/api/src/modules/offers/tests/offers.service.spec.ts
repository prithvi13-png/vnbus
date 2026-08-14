import { OffersRepository } from "../repositories/offers.repository";
import { OffersService } from "../services/offers.service";
import { OffersModuleValidator } from "../validators/offers.validator";

describe("OffersService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new OffersService(new OffersRepository(), new OffersModuleValidator());
    const summary = service.getSummary();

    expect(summary.module).toBe("offers");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("creates, updates, and toggles offers", () => {
    const service = new OffersService(new OffersRepository(), new OffersModuleValidator());
    const offer = service.createOffer({
      title: "Popup test",
      placement: "POPUP",
      startsAt: "2026-08-08T00:00:00.000Z",
      endsAt: "2026-09-01T00:00:00.000Z",
    });
    const updated = service.updateOffer(offer.offerId, { priority: 2 });
    const toggled = service.toggleOffer(offer.offerId);

    expect(updated.priority).toBe(2);
    expect(toggled.status).toBe("ACTIVE");
    expect(service.listOffers().length).toBeGreaterThan(5);
  });
});
