import { Injectable } from "@nestjs/common";
import {
  AbhiBusAdapter,
  BCIAdapter,
  CustomApiAdapter,
  MockSupplierAdapter,
  RedBusAdapter,
  SupplierIntegrationError,
  SupplierTimeoutError,
  SupplierUnavailableError,
  TBOAdapter,
  toSupplierError,
  type SeatLayoutRequest,
  type SupplierAdapter,
} from "@vnbus/supplier-sdk";
import type {
  BusSearchResult,
  IntegrationDashboardResponse,
  SeatHoldRequest,
  SeatHoldResponse,
  SeatLayoutDetails,
  SeatReleaseRequest,
  SeatReleaseResponse,
  SupplierCode,
  SupplierError,
  SupplierIntegrationConfig,
  SupplierOperation,
  TripSearchRequest,
  TripSearchResponse,
} from "@vnbus/types";

import { CircuitBreakerService } from "./circuit-breaker.service";
import { DuplicateTripDetectionService } from "./duplicate-trip.service";
import { IntegrationConfigurationService } from "./integration-configuration.service";
import { NormalizationService } from "./normalization.service";
import { SupplierHealthService } from "./supplier-health.service";
import { SupplierRequestLogService } from "./supplier-request-log.service";

type SupplierConfigOverride = Partial<Pick<SupplierIntegrationConfig, "enabled" | "priority">>;

@Injectable()
export class SupplierManagerService {
  private readonly adapters = new Map<SupplierCode, SupplierAdapter>();
  private readonly overrides = new Map<SupplierCode, SupplierConfigOverride>();

  constructor(
    private readonly configuration: IntegrationConfigurationService,
    private readonly normalizer: NormalizationService,
    private readonly duplicateDetector: DuplicateTripDetectionService,
    private readonly requestLogs: SupplierRequestLogService,
    private readonly health: SupplierHealthService,
    private readonly circuits: CircuitBreakerService,
  ) {
    [
      new MockSupplierAdapter(),
      new BCIAdapter(),
      new RedBusAdapter(),
      new AbhiBusAdapter(),
      new TBOAdapter(),
      new CustomApiAdapter(),
    ].forEach((adapter) => this.registerSupplier(adapter));
  }

  registerSupplier(adapter: SupplierAdapter): void {
    this.adapters.set(adapter.code, adapter);
  }

  enableSupplier(code: SupplierCode): SupplierIntegrationConfig | null {
    return this.updateSupplier(code, { enabled: true });
  }

  disableSupplier(code: SupplierCode): SupplierIntegrationConfig | null {
    return this.updateSupplier(code, { enabled: false });
  }

  updatePriority(code: SupplierCode, priority: number): SupplierIntegrationConfig | null {
    return this.updateSupplier(code, { priority });
  }

  listSuppliers(): SupplierIntegrationConfig[] {
    return this.configuration
      .getSupplierConfigs()
      .map((config) => ({
        ...config,
        ...(this.overrides.get(config.code) ?? {}),
      }))
      .sort((left, right) => left.priority - right.priority);
  }

  getDashboard(): IntegrationDashboardResponse {
    const suppliers = this.listSuppliers();

    return {
      supplierMode: this.configuration.getSupplierMode(),
      suppliers,
      health: this.health.list(suppliers),
      requestLogs: this.requestLogs.list(50),
      circuits: this.circuits.list(suppliers.map((supplier) => supplier.code)),
      duplicateStrategy:
        "Potential duplicates are flagged by route, operator, departure, arrival, bus type, date, and supplier metadata. Records are not merged automatically.",
      security: {
        frontendSupplierAccess: "NEVER",
        credentialStorage: "SECRET_REFERENCES_ONLY",
        credentialLogging: "REDACTED",
      },
    };
  }

  async searchTrips(request: TripSearchRequest): Promise<TripSearchResponse> {
    const requestId = request.requestId ?? createIntegrationId("REQ");
    const correlationId = request.correlationId ?? requestId;
    const candidates = this.getEnabledSupplierConfigs();

    if (!candidates.length) {
      return {
        success: false,
        status: "NO_SUPPLIER_AVAILABLE",
        trips: [],
        supplierResults: [],
        errors: [
          {
            supplierCode: "MOCK",
            operation: "SEARCH_TRIPS",
            code: "SUPPLIER_UNAVAILABLE",
            message: "No supplier is enabled for search.",
            retryable: false,
          },
        ],
        duplicateGroups: [],
        requestId,
        correlationId,
      };
    }

    const settled = await Promise.allSettled(
      candidates.map((config) =>
        this.execute(config, "SEARCH_TRIPS", true, (adapter, context) =>
          adapter.searchTrips(request, {
            ...context,
            requestId,
            correlationId,
          }),
        ),
      ),
    );
    const trips: BusSearchResult[] = [];
    const errors: SupplierError[] = [];
    const supplierResults: TripSearchResponse["supplierResults"] = [];

    settled.forEach((result, index) => {
      const config = candidates[index];
      if (!config) {
        return;
      }
      if (result.status === "fulfilled") {
        trips.push(...result.value.trips);
        supplierResults.push(...result.value.supplierResults);
      } else {
        const error = toSupplierError(result.reason, config.code, "SEARCH_TRIPS");
        errors.push(error);
        supplierResults.push({
          supplierCode: config.code,
          status: "FAILED",
          resultCount: 0,
          durationMs: 0,
          errorCode: error.code,
        });
      }
    });

    const normalizedTrips = this.normalizer.normalizeTrips(trips);

    return {
      success: normalizedTrips.length > 0,
      status: this.toSearchStatus(normalizedTrips.length, errors.length),
      trips: normalizedTrips,
      supplierResults,
      errors,
      duplicateGroups: this.duplicateDetector.detect(normalizedTrips),
      requestId,
      correlationId,
    };
  }

  getTripDetails(
    supplierCode: SupplierCode,
    tripId: string,
    journeyDate: string,
  ): Promise<BusSearchResult> {
    return this.executeForSupplier(supplierCode, "GET_TRIP_DETAILS", true, (adapter, context) =>
      adapter.getTripDetails({ supplierCode, tripId, journeyDate }, context),
    ).then((trip) => this.normalizer.normalizeTrip(trip));
  }

  getSeatLayout(request: SeatLayoutRequest): Promise<SeatLayoutDetails> {
    return this.executeForSupplier(
      request.supplierCode,
      "GET_SEAT_LAYOUT",
      true,
      (adapter, context) => adapter.getSeatLayout(request, context),
    );
  }

  holdSeats(request: SeatHoldRequest): Promise<SeatHoldResponse> {
    return this.executeForSupplier(
      request.supplierCode as SupplierCode,
      "HOLD_SEATS",
      false,
      (adapter, context) => adapter.holdSeats(request, context),
    );
  }

  releaseSeats(
    request: SeatReleaseRequest,
    supplierCode: SupplierCode = "MOCK",
  ): Promise<SeatReleaseResponse> {
    return this.executeForSupplier(supplierCode, "RELEASE_SEATS", false, (adapter, context) =>
      adapter.releaseSeats(request, context),
    );
  }

  testConnection(
    code: SupplierCode,
  ): Promise<ReturnType<SupplierAdapter["healthCheck"]> extends Promise<infer T> ? T : never> {
    const adapter = this.adapters.get(code);
    const config = this.listSuppliers().find((supplier) => supplier.code === code);

    if (!adapter || !config) {
      throw new SupplierUnavailableError(
        code,
        "HEALTH_CHECK",
        "Supplier adapter is not registered.",
      );
    }

    return this.execute(config, "HEALTH_CHECK", true, (registered, context) =>
      registered.healthCheck(context),
    );
  }

  private updateSupplier(
    code: SupplierCode,
    override: SupplierConfigOverride,
  ): SupplierIntegrationConfig | null {
    const existing = this.listSuppliers().find((supplier) => supplier.code === code);
    if (!existing) {
      return null;
    }
    this.overrides.set(code, {
      ...(this.overrides.get(code) ?? {}),
      ...override,
    });

    return this.listSuppliers().find((supplier) => supplier.code === code) ?? null;
  }

  private getEnabledSupplierConfigs(): SupplierIntegrationConfig[] {
    return this.listSuppliers().filter(
      (config) => config.enabled && this.adapters.has(config.code),
    );
  }

  private executeForSupplier<T>(
    code: SupplierCode,
    operation: SupplierOperation,
    retrySafe: boolean,
    call: (
      adapter: SupplierAdapter,
      context: { requestId: string; correlationId: string; traceId: string },
    ) => Promise<T>,
  ): Promise<T> {
    const config = this.listSuppliers().find((supplier) => supplier.code === code);

    if (!config || !config.enabled) {
      return Promise.reject(
        new SupplierUnavailableError(code, operation, `${code} is disabled or unavailable.`),
      );
    }

    return this.execute(config, operation, retrySafe, call);
  }

  private async execute<T>(
    config: SupplierIntegrationConfig,
    operation: SupplierOperation,
    retrySafe: boolean,
    call: (
      adapter: SupplierAdapter,
      context: { requestId: string; correlationId: string; traceId: string },
    ) => Promise<T>,
  ): Promise<T> {
    const adapter = this.adapters.get(config.code);

    if (!adapter) {
      throw new SupplierUnavailableError(
        config.code,
        operation,
        "Supplier adapter is not registered.",
      );
    }
    if (!this.circuits.canRequest(config)) {
      throw new SupplierUnavailableError(
        config.code,
        operation,
        `${config.code} circuit breaker is open.`,
      );
    }

    const attempts = retrySafe ? config.timeout.retryCount + 1 : 1;
    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const requestId = createIntegrationId("SUPREQ");
      const traceId = createIntegrationId("TRACE");
      const correlationId = requestId;
      const startedAt = Date.now();

      try {
        const result = await withTimeout(
          call(adapter, { requestId, correlationId, traceId }),
          config.timeout.requestTimeoutMs,
          () => new SupplierTimeoutError(config.code, operation),
        );
        const durationMs = Date.now() - startedAt;
        this.circuits.recordSuccess(config);
        this.health.recordSuccess(config.code, durationMs);
        this.requestLogs.record({
          requestId,
          supplierCode: config.code,
          operation,
          timestamp: new Date(startedAt).toISOString(),
          durationMs,
          httpStatus: null,
          success: true,
          errorCode: null,
          correlationId,
          traceId,
        });

        return result;
      } catch (error) {
        lastError = error;
        const durationMs = Date.now() - startedAt;
        const supplierError = toSupplierError(error, config.code, operation);
        this.circuits.recordFailure(config);
        this.health.recordFailure(config.code, operation, durationMs);
        this.requestLogs.record({
          requestId,
          supplierCode: config.code,
          operation,
          timestamp: new Date(startedAt).toISOString(),
          durationMs,
          httpStatus: null,
          success: false,
          errorCode: supplierError.code,
          correlationId,
          traceId,
        });
        if (!retrySafe || !supplierError.retryable || attempt === attempts) {
          throw error;
        }
        await wait(config.timeout.retryDelayMs * attempt);
      }
    }

    throw lastError instanceof SupplierIntegrationError
      ? lastError
      : new SupplierUnavailableError(config.code, operation);
  }

  private toSearchStatus(resultCount: number, errorCount: number): TripSearchResponse["status"] {
    if (!resultCount && errorCount) {
      return "SUPPLIER_UNAVAILABLE";
    }
    if (resultCount && errorCount) {
      return "SEARCH_PARTIALLY_AVAILABLE";
    }
    if (!resultCount) {
      return "NO_SUPPLIER_AVAILABLE";
    }

    return "AVAILABLE";
  }
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  createError: () => Error,
): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;

  return Promise.race([
    promise,
    new Promise<T>((_resolve, reject) => {
      timeout = setTimeout(() => reject(createError()), timeoutMs);
    }),
  ]).finally(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createIntegrationId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}
