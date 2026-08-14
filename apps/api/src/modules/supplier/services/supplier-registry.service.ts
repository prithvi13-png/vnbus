import { Injectable } from "@nestjs/common";
import {
  AbhiBusAdapter,
  BCIAdapter,
  CustomApiAdapter,
  MockSupplierAdapter,
  RedBusAdapter,
  TBOAdapter,
  type SupplierAdapter,
} from "@vnbus/supplier-sdk";

import type { SupplierRegistryPort } from "../interfaces/supplier-registry.interface";

@Injectable()
export class SupplierRegistryService implements SupplierRegistryPort {
  private readonly adapters = new Map<string, SupplierAdapter>(
    [
      new MockSupplierAdapter(),
      new BCIAdapter(),
      new RedBusAdapter(),
      new AbhiBusAdapter(),
      new TBOAdapter(),
      new CustomApiAdapter(),
    ].map((adapter) => [adapter.code, adapter]),
  );

  listAdapters(): SupplierAdapter[] {
    return Array.from(this.adapters.values());
  }

  getAdapter(code: string): SupplierAdapter | null {
    return this.adapters.get(code.toUpperCase()) ?? null;
  }
}
