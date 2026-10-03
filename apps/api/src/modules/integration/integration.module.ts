import { Module } from "@nestjs/common";

import { IntegrationController } from "./controllers/integration.controller";
import { CircuitBreakerService } from "./services/circuit-breaker.service";
import { DistributedLockService } from "./services/distributed-lock.service";
import { DuplicateTripDetectionService } from "./services/duplicate-trip.service";
import { FareService } from "./services/fare.service";
import { IdempotencyService } from "./services/idempotency.service";
import { IntegrationConfigurationService } from "./services/integration-configuration.service";
import { NormalizationService } from "./services/normalization.service";
import { SupplierHealthService } from "./services/supplier-health.service";
import { SupplierManagerService } from "./services/supplier-manager.service";
import { SupplierRequestLogService } from "./services/supplier-request-log.service";
import { TripCacheService } from "./services/trip-cache.service";

@Module({
  controllers: [IntegrationController],
  providers: [
    CircuitBreakerService,
    DistributedLockService,
    DuplicateTripDetectionService,
    FareService,
    IdempotencyService,
    IntegrationConfigurationService,
    NormalizationService,
    SupplierHealthService,
    SupplierManagerService,
    SupplierRequestLogService,
    TripCacheService,
  ],
  exports: [
    CircuitBreakerService,
    DistributedLockService,
    DuplicateTripDetectionService,
    FareService,
    IdempotencyService,
    IntegrationConfigurationService,
    NormalizationService,
    SupplierHealthService,
    SupplierManagerService,
    SupplierRequestLogService,
    TripCacheService,
  ],
})
export class IntegrationModule {}
