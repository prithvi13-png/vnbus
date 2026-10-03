import { Injectable } from "@nestjs/common";
import type {
  AdminSupplierConfigurationRecord,
  SupplierIntegrationConfig,
  UpdateAdminSupplierConfigurationRequest,
} from "@vnbus/types";

import { IntegrationConfigurationService } from "../../integration/services/integration-configuration.service";

/**
 * Supplier settings as the environment configures them: a supplier is enabled
 * when its URL and credential are set. Admin edits are kept in memory on top.
 */
@Injectable()
export class SupplierConfigurationRepository {
  private readonly configurations: Map<string, AdminSupplierConfigurationRecord>;

  constructor(configuration: IntegrationConfigurationService) {
    const loadedAt = new Date().toISOString();

    this.configurations = new Map(
      configuration
        .getSupplierConfigs()
        .map((config) => toRecord(config, loadedAt))
        .map((record) => [record.supplierId, record]),
    );
  }

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

function toRecord(
  config: SupplierIntegrationConfig,
  loadedAt: string,
): AdminSupplierConfigurationRecord {
  return {
    supplierId: `SUPCFG-${config.code}`,
    code: config.code,
    name: config.name,
    enabled: config.enabled,
    priority: config.priority,
    healthStatus: config.enabled ? "HEALTHY" : "DISABLED",
    environment: config.environment,
    apiKeySecretRef: config.credentialReference ?? "",
    updatedAt: loadedAt,
  };
}
