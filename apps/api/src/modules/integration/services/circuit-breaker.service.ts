import { Injectable } from "@nestjs/common";
import type {
  SupplierCircuitStateRecord,
  SupplierCode,
  SupplierIntegrationConfig,
} from "@vnbus/types";

@Injectable()
export class CircuitBreakerService {
  private readonly states = new Map<SupplierCode, SupplierCircuitStateRecord>();

  canRequest(config: SupplierIntegrationConfig): boolean {
    const state = this.getState(config.code);

    if (state.state !== "OPEN") {
      return true;
    }

    if (state.nextRetryAt && Date.parse(state.nextRetryAt) <= Date.now()) {
      this.states.set(config.code, {
        ...state,
        state: "HALF_OPEN",
      });

      return true;
    }

    return false;
  }

  recordSuccess(config: SupplierIntegrationConfig): void {
    this.states.set(config.code, {
      supplierCode: config.code,
      state: "CLOSED",
      failureCount: 0,
      openedAt: null,
      nextRetryAt: null,
    });
  }

  recordFailure(config: SupplierIntegrationConfig): void {
    const current = this.getState(config.code);
    const failureCount = current.failureCount + 1;
    const shouldOpen = failureCount >= config.timeout.circuitBreakerThreshold;
    const openedAt = shouldOpen ? new Date() : null;

    this.states.set(config.code, {
      supplierCode: config.code,
      state: shouldOpen ? "OPEN" : current.state,
      failureCount,
      openedAt: openedAt?.toISOString() ?? current.openedAt,
      nextRetryAt: openedAt
        ? new Date(openedAt.getTime() + config.timeout.circuitBreakerCooldownMs).toISOString()
        : current.nextRetryAt,
    });
  }

  getState(supplierCode: SupplierCode): SupplierCircuitStateRecord {
    return (
      this.states.get(supplierCode) ?? {
        supplierCode,
        state: "CLOSED",
        failureCount: 0,
        openedAt: null,
        nextRetryAt: null,
      }
    );
  }

  list(codes: SupplierCode[]): SupplierCircuitStateRecord[] {
    return codes.map((code) => this.getState(code));
  }
}
