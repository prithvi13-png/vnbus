import { Module } from "@nestjs/common";

import { SettingsController } from "./controllers/settings.controller";
import { SettingsRepository } from "./repositories/settings.repository";
import { SettingsService } from "./services/settings.service";
import { SettingsModuleValidator } from "./validators/settings.validator";

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, SettingsRepository, SettingsModuleValidator],
  exports: [SettingsService],
})
export class SettingsModule {}
