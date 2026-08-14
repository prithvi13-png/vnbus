import { Injectable } from "@nestjs/common";
import type { AdminPlatformSettingRecord, AdminPlatformSettingsResponse } from "@vnbus/types";

import type { UpdatePlatformSettingDto } from "../dto/platform-settings.dto";
import { PlatformSettingsRepository } from "../repositories/platform-settings.repository";
import { PlatformSettingsValidator } from "../validators/platform-settings.validator";

@Injectable()
export class PlatformSettingsService {
  constructor(
    private readonly repository: PlatformSettingsRepository,
    private readonly validator: PlatformSettingsValidator,
  ) {}

  getSettings(): AdminPlatformSettingsResponse {
    return this.repository.getSettings();
  }

  updateSetting(settingId: string, dto: UpdatePlatformSettingDto): AdminPlatformSettingRecord {
    const setting = this.repository.updateSetting(settingId, dto);
    this.validator.ensureFound(setting);

    return setting;
  }
}
