import { Module } from "@nestjs/common";

import { PlatformSettingsController } from "./controllers/platform-settings.controller";
import { PlatformSettingsRepository } from "./repositories/platform-settings.repository";
import { PlatformSettingsService } from "./services/platform-settings.service";
import { PlatformSettingsValidator } from "./validators/platform-settings.validator";

@Module({
  controllers: [PlatformSettingsController],
  providers: [PlatformSettingsService, PlatformSettingsRepository, PlatformSettingsValidator],
  exports: [PlatformSettingsService],
})
export class PlatformSettingsModule {}
