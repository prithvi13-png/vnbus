import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { AdminPlatformSettingRecord, AdminPlatformSettingsResponse } from "@vnbus/types";

import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { UpdatePlatformSettingDto } from "../dto/platform-settings.dto";
import { PlatformSettingsService } from "../services/platform-settings.service";

@ApiTags("Platform Settings")
@ApiBearerAuth()
@Controller("platform-settings")
export class PlatformSettingsController {
  constructor(private readonly service: PlatformSettingsService) {}

  @Roles("ADMIN")
  @Get()
  @ApiOkResponse({ description: "Brand, support, timezone, currency, tax, and policy settings" })
  getSettings(): AdminPlatformSettingsResponse {
    return this.service.getSettings();
  }

  @Roles("ADMIN")
  @Patch(":settingId")
  @ApiOkResponse({ description: "Update platform setting value" })
  updateSetting(
    @Param("settingId") settingId: string,
    @Body() dto: UpdatePlatformSettingDto,
  ): AdminPlatformSettingRecord {
    return this.service.updateSetting(settingId, dto);
  }
}
