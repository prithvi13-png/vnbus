import { Injectable } from "@nestjs/common";
import type { AdminFeatureFlagRecord } from "@vnbus/types";

import type { UpdateFeatureFlagDto } from "../dto/feature-flag.dto";
import { FeatureFlagRepository } from "../repositories/feature-flag.repository";
import { FeatureFlagValidator } from "../validators/feature-flag.validator";

@Injectable()
export class FeatureFlagService {
  constructor(
    private readonly repository: FeatureFlagRepository,
    private readonly validator: FeatureFlagValidator,
  ) {}

  list(): AdminFeatureFlagRecord[] {
    return this.repository.list();
  }

  update(flagId: string, dto: UpdateFeatureFlagDto): AdminFeatureFlagRecord {
    const flag = this.repository.update(flagId, dto);
    this.validator.ensureFound(flag);

    return flag;
  }
}
