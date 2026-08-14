import { Injectable } from "@nestjs/common";

import { SupplierSummaryDto } from "../dto/supplier-summary.dto";
import type { SupplierModulePort } from "../interfaces/supplier.interface";
import { SupplierRepository } from "../repositories/supplier.repository";
import { SupplierModuleValidator } from "../validators/supplier.validator";

@Injectable()
export class SupplierService implements SupplierModulePort {
  constructor(
    private readonly repository: SupplierRepository,
    private readonly validator: SupplierModuleValidator,
  ) {}

  getSummary(): SupplierSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new SupplierSummaryDto(summary);
  }
}
