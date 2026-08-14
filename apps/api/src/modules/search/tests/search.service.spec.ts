import { BadRequestException } from "@nestjs/common";

import { createTestSupplierManager } from "../../integration/tests/integration-test-helpers";
import { SearchRepository } from "../repositories/search.repository";
import { SearchService } from "../services/search.service";
import { SearchModuleValidator } from "../validators/search.validator";

describe("SearchService", () => {
  const createService = (): SearchService =>
    new SearchService(
      new SearchRepository(),
      new SearchModuleValidator(),
      createTestSupplierManager(),
    );

  it("returns module readiness and capabilities", () => {
    const service = createService();
    const summary = service.getSummary();

    expect(summary.module).toBe("search");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("exposes realistic mock dataset counts", () => {
    const service = createService();
    const summary = service.getDatasetSummary();

    expect(summary.counts.buses).toBeGreaterThanOrEqual(500);
    expect(summary.counts.operators).toBeGreaterThanOrEqual(100);
    expect(summary.counts.routes).toBeGreaterThanOrEqual(100);
    expect(summary.counts.boardingPoints).toBeGreaterThanOrEqual(500);
    expect(summary.counts.droppingPoints).toBeGreaterThanOrEqual(500);
  });

  it("searches, sorts, filters, and paginates route results", async () => {
    const service = createService();
    const result = await service.search({
      sourceCity: "Bangalore",
      destinationCity: "Hyderabad",
      journeyDate: tomorrowIsoDate(),
      passengerCount: 1,
      busTypes: ["AC Sleeper"],
      sortBy: "PRICE_ASC",
      page: 1,
      pageSize: 3,
    });

    expect(result.success).toBe(true);
    expect(result.totalResults).toBeGreaterThan(0);
    expect(result.buses).toHaveLength(Math.min(3, result.totalResults));
    expect(result.buses.every((bus) => bus.busType === "AC Sleeper")).toBe(true);
    expect(result.buses[0]?.fare.amount).toBeLessThanOrEqual(
      result.buses[1]?.fare.amount ?? Number.MAX_SAFE_INTEGER,
    );
    expect(result.filters.operators.length).toBeGreaterThan(0);
    expect(result.pagination.page).toBe(1);
  });

  it("returns search suggestions, recent searches, and analytics insights", () => {
    const service = createService();
    const updated = service.recordRecentSearch({
      sourceCity: "Bangalore",
      destinationCity: "Mysore",
    });
    const insights = service.getInsights();

    expect(service.getSuggestions("Bangalore").length).toBeGreaterThan(0);
    expect(updated.recentSearches[0]?.label).toBe("Bangalore to Mysore");
    expect(insights.autocompleteCache.length).toBeGreaterThan(0);
    expect(insights.averageBookingTimeSeconds).toBeGreaterThan(0);
  });

  it("rejects past journey dates", async () => {
    const service = createService();

    await expect(
      service.search({
        sourceCity: "Bangalore",
        destinationCity: "Hyderabad",
        journeyDate: "2020-01-01",
        passengerCount: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

function tomorrowIsoDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);

  return date.toISOString().slice(0, 10);
}
