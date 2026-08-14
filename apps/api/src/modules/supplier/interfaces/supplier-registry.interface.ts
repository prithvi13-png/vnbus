import type { SupplierAdapter } from "@vnbus/supplier-sdk";

export interface SupplierRegistryPort {
  listAdapters(): SupplierAdapter[];
  getAdapter(code: string): SupplierAdapter | null;
}
