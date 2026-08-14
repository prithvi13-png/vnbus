import { Injectable } from "@nestjs/common";
import type {
  AdminSupplierConfigurationRecord,
  UpdateAdminSupplierConfigurationRequest,
} from "@vnbus/types";

@Injectable()
export class SupplierConfigurationRepository {
  private readonly configurations = new Map<string, AdminSupplierConfigurationRecord>(
    seedConfigurations().map((configuration) => [configuration.supplierId, configuration]),
  );

  list(): AdminSupplierConfigurationRecord[] {
    return [...this.configurations.values()].sort((left, right) => left.priority - right.priority);
  }

  update(
    supplierId: string,
    input: UpdateAdminSupplierConfigurationRequest,
  ): AdminSupplierConfigurationRecord | null {
    const existing = this.find(supplierId);
    if (!existing) {
      return null;
    }

    const updated: AdminSupplierConfigurationRecord = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.configurations.set(updated.supplierId, updated);

    return updated;
  }

  find(supplierId: string): AdminSupplierConfigurationRecord | null {
    return (
      this.configurations.get(supplierId) ??
      this.list().find((configuration) => configuration.code === supplierId) ??
      null
    );
  }
}

function seedConfigurations(): AdminSupplierConfigurationRecord[] {
  return [
    supplier("SUPCFG-MOCK", "MOCK", "Mock Supplier", true, 1, "HEALTHY"),
    supplier("SUPCFG-BCI", "BCI", "BCI", false, 2, "DISABLED"),
    supplier("SUPCFG-ABHIBUS", "ABHIBUS", "AbhiBus", false, 3, "DISABLED"),
    supplier("SUPCFG-REDBUS", "REDBUS", "RedBus", false, 4, "DISABLED"),
    supplier("SUPCFG-TBO", "TBO", "TBO", false, 5, "DISABLED"),
    supplier("SUPCFG-CUSTOM", "CUSTOM", "Custom", false, 6, "DISABLED"),
  ];
}

function supplier(
  supplierId: string,
  code: AdminSupplierConfigurationRecord["code"],
  name: string,
  enabled: boolean,
  priority: number,
  healthStatus: AdminSupplierConfigurationRecord["healthStatus"],
): AdminSupplierConfigurationRecord {
  return {
    supplierId,
    code,
    name,
    enabled,
    priority,
    healthStatus,
    environment: "MOCK",
    apiKeySecretRef: `encrypted-placeholder://${code.toLowerCase()}/api-key`,
    updatedAt: "2026-08-08T08:00:00.000Z",
  };
}
