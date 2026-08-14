import { Module } from "@nestjs/common";

import { FeatureFlagController } from "./controllers/feature-flag.controller";
import { FeatureFlagRepository } from "./repositories/feature-flag.repository";
import { FeatureFlagService } from "./services/feature-flag.service";
import { FeatureFlagValidator } from "./validators/feature-flag.validator";

@Module({
  controllers: [FeatureFlagController],
  providers: [FeatureFlagService, FeatureFlagRepository, FeatureFlagValidator],
  exports: [FeatureFlagService],
})
export class FeatureFlagModule {}
