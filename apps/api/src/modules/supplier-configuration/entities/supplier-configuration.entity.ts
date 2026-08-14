import type { AdminSupplierConfigurationRecord } from "@vnbus/types";

export class SupplierConfigurationEntity {
  constructor(readonly configuration: AdminSupplierConfigurationRecord) {}
}
