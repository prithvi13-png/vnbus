import { BCIAdapter, MockSupplierAdapter, SupplierUnavailableError } from "@vnbus/supplier-sdk";
import type {
  SupplierIntegrationConfig,
  TripSearchRequest,
  TripSearchResponse,
} from "@vnbus/types";

import { DistributedLockService } from "../services/distributed-lock.service";
import { DuplicateTripDetectionService } from "../services/duplicate-trip.service";
import { IdempotencyService } from "../services/idempotency.service";
import { NormalizationService } from "../services/normalization.service";
import { createTestSupplierManager } from "./integration-test-helpers";

class FailingBCIAdapter extends BCIAdapter {
  override searchTrips(_request: TripSearchRequest): Promise<TripSearchResponse> {
    return Promise.reject(new SupplierUnavailableError("BCI", "SEARCH_TRIPS"));
  }
}

class SlowBCIAdapter extends BCIAdapter {
  private readonly mock = new MockSupplierAdapter();

  override searchTrips(request: TripSearchRequest): Promise<TripSearchResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.mock.searchTrips(request).then(resolve).catch(reject);
      }, 50);
    });
  }
}

describe("SupplierManagerService", () => {
  it("searches through the active mock supplier", async () => {
    const manager = createTestSupplierManager();
    const result = await manager.searchTrips(searchRequest());

    expect(result.success).toBe(true);
    expect(result.status).toBe("AVAILABLE");
    expect(result.supplierResults[0]?.supplierCode).toBe("MOCK");
    expect(manager.getDashboard().requestLogs.length).toBeGreaterThan(0);
  });

  it("keeps parallel search available when one supplier fails", async () => {
    const manager = createTestSupplierManager([
      supplierConfig("MOCK", true, 1),
      supplierConfig("BCI", true, 2),
    ]);
    manager.registerSupplier(new FailingBCIAdapter());

    const result = await manager.searchTrips(searchRequest());

    expect(result.success).toBe(true);
    expect(result.status).toBe("SEARCH_PARTIALLY_AVAILABLE");
    expect(result.errors[0]?.supplierCode).toBe("BCI");
  });

  it("opens the circuit breaker after repeated supplier failure", async () => {
    const manager = createTestSupplierManager([supplierConfig("BCI", true, 1, 100, 0, 2)]);
    manager.registerSupplier(new FailingBCIAdapter());

    await manager.searchTrips(searchRequest());
    await manager.searchTrips(searchRequest());

    expect(manager.getDashboard().circuits[0]).toMatchObject({
      supplierCode: "BCI",
      state: "OPEN",
      failureCount: 2,
    });
  });

  it("converts supplier timeouts into normalized errors", async () => {
    const manager = createTestSupplierManager([supplierConfig("BCI", true, 1, 5, 0, 3)]);
    manager.registerSupplier(new SlowBCIAdapter());

    const result = await manager.searchTrips(searchRequest());

    expect(result.success).toBe(false);
    expect(result.errors[0]?.code).toBe("SUPPLIER_TIMEOUT");
  });

  it("detects duplicate inventory without merging supplier records", async () => {
    const detector = new DuplicateTripDetectionService();
    const manager = createTestSupplierManager();
    const result = await manager.searchTrips(searchRequest());
    const first = result.trips[0];
    expect(first).toBeDefined();

    const duplicates = detector.detect([
      { ...first!, supplierCode: "MOCK", tripId: "mock-trip-a" },
      { ...first!, supplierCode: "BCI", tripId: "bci-trip-a" },
    ]);

    expect(duplicates).toHaveLength(1);
    expect(duplicates[0]?.tripRefs).toEqual(["MOCK:mock-trip-a", "BCI:bci-trip-a"]);
  });

  it("normalizes money and labels", () => {
    const normalizer = new NormalizationService();
    const manager = createTestSupplierManager();

    return manager.searchTrips(searchRequest()).then((result) => {
      const trip = result.trips[0]!;
      const normalized = normalizer.normalizeTrip({
        ...trip,
        operatorName: "  eastern   travels ",
        fare: { amount: 1234.567, currency: "INR" },
      });

      expect(normalized.operatorName).toBe("Eastern Travels");
      expect(normalized.fare.amount).toBe(1234.57);
    });
  });

  it("guards idempotent operations and distributed locks", async () => {
    const idempotency = new IdempotencyService();
    const locks = new DistributedLockService();
    const first = await idempotency.runWithKey("booking-confirm", "same-key", { id: 1 }, () =>
      Promise.resolve({ bookingId: "BKG-1" }),
    );
    const second = await idempotency.runWithKey("booking-confirm", "same-key", { id: 1 }, () =>
      Promise.resolve({ bookingId: "BKG-2" }),
    );

    expect(first).toEqual(second);
    await expect(
      locks.withLock("seat:1A", "owner-a", 1000, () =>
        locks.withLock("seat:1A", "owner-b", 1000, () => Promise.resolve("locked")),
      ),
    ).rejects.toThrow("Operation is locked by another request");
  });
});

function searchRequest(): TripSearchRequest {
  return {
    sourceCity: "Bangalore",
    destinationCity: "Hyderabad",
    journeyDate: tomorrowIsoDate(),
    passengerCount: 1,
  };
}

function supplierConfig(
  code: SupplierIntegrationConfig["code"],
  enabled: boolean,
  priority: number,
  requestTimeoutMs = 100,
  retryCount = 0,
  circuitBreakerThreshold = 3,
): SupplierIntegrationConfig {
  return {
    code,
    name: code,
    enabled,
    priority,
    environment: code === "MOCK" ? "MOCK" : "SANDBOX_PLACEHOLDER",
    baseUrl: code === "MOCK" ? null : "https://placeholder.example.test",
    credentialReference: code === "MOCK" ? null : `secret://${code.toLowerCase()}/api-key`,
    healthStatus: "UNKNOWN",
    timeout: {
      connectionTimeoutMs: 10,
      requestTimeoutMs,
      retryCount,
      retryDelayMs: 1,
      circuitBreakerThreshold,
      circuitBreakerCooldownMs: 1000,
    },
  };
}

function tomorrowIsoDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);

  return date.toISOString().slice(0, 10);
}
