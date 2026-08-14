import { Injectable } from "@nestjs/common";

import { SettingsSummaryDto } from "../dto/settings-summary.dto";
import type { SettingsModulePort } from "../interfaces/settings.interface";
import { SettingsRepository } from "../repositories/settings.repository";
import { SettingsModuleValidator } from "../validators/settings.validator";

@Injectable()
export class SettingsService implements SettingsModulePort {
  constructor(
    private readonly repository: SettingsRepository,
    private readonly validator: SettingsModuleValidator,
  ) {}

  getSummary(): SettingsSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new SettingsSummaryDto(summary);
  }
}
