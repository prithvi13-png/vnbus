import { Injectable } from "@nestjs/common";
import type { AdminSupplierConfigurationRecord } from "@vnbus/types";

import type { UpdateSupplierConfigurationDto } from "../dto/supplier-configuration.dto";
import { SupplierConfigurationRepository } from "../repositories/supplier-configuration.repository";
import { SupplierConfigurationValidator } from "../validators/supplier-configuration.validator";

@Injectable()
export class SupplierConfigurationService {
  constructor(
    private readonly repository: SupplierConfigurationRepository,
    private readonly validator: SupplierConfigurationValidator,
  ) {}

  list(): AdminSupplierConfigurationRecord[] {
    return this.repository.list();
  }

  update(
    supplierId: string,
    dto: UpdateSupplierConfigurationDto,
  ): AdminSupplierConfigurationRecord {
    const configuration = this.repository.update(supplierId, dto);
    this.validator.ensureFound(configuration);

    return configuration;
  }
}
