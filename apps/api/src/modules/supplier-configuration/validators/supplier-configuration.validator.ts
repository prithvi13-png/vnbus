import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class SupplierConfigurationValidator {
  ensureFound<T>(value: T | null | undefined): asserts value is T {
    if (!value) {
      throw new NotFoundException("Supplier configuration not found");
    }
  }
}
