import { BadRequestException } from "@nestjs/common";
import type { SupplierAdapter } from "@vnbus/supplier-sdk";
import type { TripSearchResponse } from "@vnbus/types";

import { testConfig } from "../../../shared/tests/booking-harness";
import { FakeSupplierAdapter } from "../../../shared/tests/fake-supplier";
import { IntegrationConfigurationService } from "../../integration/services/integration-configuration.service";
import {
  createTestSupplierManager,
  supplierConfig,
} from "../../integration/tests/integration-test-helpers";
import { SearchRepository } from "../repositories/search.repository";
import { CityDirectoryService } from "../services/city-directory.service";
import { SearchService } from "../services/search.service";
import { SearchModuleValidator } from "../validators/search.validator";

function createService(
  supplier: SupplierAdapter = new FakeSupplierAdapter(),
  configuration = new IntegrationConfigurationService(testConfig()),
  supplierEnabled = true,
): SearchService {
  return new SearchService(
    new SearchRepository(),
    new SearchModuleValidator(),
    createTestSupplierManager([supplierConfig("SRDV", supplierEnabled, 1, 1000)], supplier),
    new CityDirectoryService(configuration),
  );
}

describe("SearchService", () => {
  it("returns module readiness and capabilities", () => {
    const summary = createService().getSummary();

    expect(summary.module).toBe("search");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("searches, sorts, filters, and paginates supplier results", async () => {
    const result = await createService().search({
      sourceCity: "Bangalore",
      destinationCity: "Hyderabad",
      journeyDate: tomorrowIsoDate(),
      passengerCount: 1,
      busTypes: ["Volvo A/C Sleeper (2+1)"],
      ac: true,
      sortBy: "PRICE_ASC",
      page: 1,
      pageSize: 1,
    });

    expect(result.success).toBe(true);
    expect(result.totalResults).toBe(2);
    expect(result.buses).toHaveLength(1);
    expect(result.filters.busTypes).toEqual([
      { label: "Volvo A/C Sleeper (2+1)", value: "Volvo A/C Sleeper (2+1)", count: 2 },
    ]);
    expect(result.filters.ratings).toEqual([]);
    expect(result.notice).toBeUndefined();
  });

  it("explains an empty search when the supplier does not serve a city", async () => {
    const supplier = new FakeSupplierAdapter();
    supplier.searchTrips = (): Promise<TripSearchResponse> =>
      Promise.resolve({
        success: false,
        status: "SUPPLIER_UNAVAILABLE",
        trips: [],
        supplierResults: [],
        errors: [
          {
            supplierCode: "SRDV",
            operation: "SEARCH_TRIPS",
            code: "SUPPLIER_VALIDATION",
            message: 'No SRDV city code is mapped for "Atlantis"',
            retryable: true,
          },
        ],
        duplicateGroups: [],
        requestId: "",
        correlationId: "",
      });

    const result = await createService(supplier).search({
      sourceCity: "Atlantis",
      destinationCity: "Hyderabad",
      journeyDate: tomorrowIsoDate(),
      passengerCount: 1,
    });

    expect(result.totalResults).toBe(0);
    expect(result.notice).toContain("Atlantis");
  });

  it("says search is unavailable when no supplier is configured", async () => {
    const result = await createService(undefined, undefined, false).search({
      sourceCity: "Bangalore",
      destinationCity: "Hyderabad",
      journeyDate: tomorrowIsoDate(),
      passengerCount: 1,
    });

    expect(result.notice).toBe("Bus search is not available right now. Please try again shortly.");
  });

  it("suggests the supplier's own cities, best match first", () => {
    const service = createService();
    const cities = service.suggestCities("bang");

    expect(cities[0]).toEqual({ name: "Bangalore", state: "Karnataka" });
    expect(service.suggestCities("b")).toEqual([]);
  });

  it("includes cities added through SRDV_CITY_CODES", () => {
    const service = createService(
      undefined,
      new IntegrationConfigurationService(testConfig({ SRDV_CITY_CODES: "zzqtown:99999" })),
    );

    expect(service.suggestCities("zzqt")).toEqual([{ name: "Zzqtown", state: "" }]);
  });

  it("builds suggestions and insights from real searches only", async () => {
    const service = createService();

    expect(service.getSuggestions()).toEqual([]);
    expect(service.getInsights().popularRoutes).toEqual([]);

    await service.search({
      sourceCity: "Bangalore",
      destinationCity: "Hyderabad",
      journeyDate: tomorrowIsoDate(),
      passengerCount: 1,
    });
    const updated = service.recordRecentSearch({
      sourceCity: "Bangalore",
      destinationCity: "Mysore",
    });

    expect(service.getSuggestions("Bangalore")[0]).toMatchObject({
      label: "Bangalore to Hyderabad",
      searchCount: 1,
    });
    expect(updated.recentSearches[0]?.label).toBe("Bangalore to Mysore");
    expect(updated.averageBookingTimeSeconds).toBe(0);
  });

  it("rejects past journey dates", async () => {
    await expect(
      createService().search({
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
