import type { SupplierIntegrationConfig } from "@vnbus/types";

import { CircuitBreakerService } from "../services/circuit-breaker.service";
import { DuplicateTripDetectionService } from "../services/duplicate-trip.service";
import { IntegrationConfigurationService } from "../services/integration-configuration.service";
import { NormalizationService } from "../services/normalization.service";
import { SupplierHealthService } from "../services/supplier-health.service";
import { SupplierManagerService } from "../services/supplier-manager.service";
import { SupplierRequestLogService } from "../services/supplier-request-log.service";

class TestIntegrationConfigurationService extends IntegrationConfigurationService {
  constructor(private readonly supplierConfigs?: SupplierIntegrationConfig[]) {
    super();
  }

  override getSupplierConfigs(): SupplierIntegrationConfig[] {
    return this.supplierConfigs ?? super.getSupplierConfigs();
  }
}

export function createTestSupplierManager(
  supplierConfigs?: SupplierIntegrationConfig[],
): SupplierManagerService {
  return new SupplierManagerService(
    new TestIntegrationConfigurationService(supplierConfigs),
    new NormalizationService(),
    new DuplicateTripDetectionService(),
    new SupplierRequestLogService(),
    new SupplierHealthService(),
    new CircuitBreakerService(),
  );
}
