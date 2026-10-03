import type { SupplierAdapter } from "@vnbus/supplier-sdk";
import type { SupplierIntegrationConfig } from "@vnbus/types";

import { FakeSupplierAdapter } from "../../../shared/tests/fake-supplier";
import { CircuitBreakerService } from "../services/circuit-breaker.service";
import { DuplicateTripDetectionService } from "../services/duplicate-trip.service";
import { IntegrationConfigurationService } from "../services/integration-configuration.service";
import { NormalizationService } from "../services/normalization.service";
import { SupplierHealthService } from "../services/supplier-health.service";
import { SupplierManagerService } from "../services/supplier-manager.service";
import { SupplierRequestLogService } from "../services/supplier-request-log.service";
import { TripCacheService } from "../services/trip-cache.service";

class TestIntegrationConfigurationService extends IntegrationConfigurationService {
  constructor(private readonly supplierConfigs: SupplierIntegrationConfig[]) {
    super();
  }

  override getSupplierConfigs(): SupplierIntegrationConfig[] {
    return this.supplierConfigs;
  }
}

/**
 * A supplier manager over the given supplier configs, with the fake SRDV
 * adapter registered. By default only SRDV is configured, and enabled.
 */
export function createTestSupplierManager(
  supplierConfigs: SupplierIntegrationConfig[] = [supplierConfig("SRDV", true, 1)],
  supplier: SupplierAdapter = new FakeSupplierAdapter(),
): SupplierManagerService {
  const manager = new SupplierManagerService(
    new TestIntegrationConfigurationService(supplierConfigs),
    new NormalizationService(),
    new DuplicateTripDetectionService(),
    new SupplierRequestLogService(),
    new SupplierHealthService(),
    new CircuitBreakerService(),
    new TripCacheService(),
  );
  manager.registerSupplier(supplier);

  return manager;
}

export function supplierConfig(
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
    environment: "SANDBOX_PLACEHOLDER",
    baseUrl: "https://supplier.test",
    credentialReference: `secret://${code.toLowerCase()}/api-key`,
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
