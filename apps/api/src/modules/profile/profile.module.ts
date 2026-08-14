import { Module } from "@nestjs/common";

import { ActivityModule } from "../activity/activity.module";
import { ProfileController } from "./controllers/profile.controller";
import { ProfileRepository } from "./repositories/profile.repository";
import { ProfileService } from "./services/profile.service";
import { ProfileValidator } from "./validators/profile.validator";

@Module({
  imports: [ActivityModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository, ProfileValidator],
  exports: [ProfileService],
})
export class ProfileModule {}
