import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { SettingsSummaryDto } from "../dto/settings-summary.dto";
import { SettingsService } from "../services/settings.service";

@ApiTags("Settings")
@ApiBearerAuth()
@Controller("settings")
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Public()
  @Get("health")
  getHealth(): SettingsSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("capabilities")
  getCapabilities(): SettingsSummaryDto {
    return this.service.getSummary();
  }
}
