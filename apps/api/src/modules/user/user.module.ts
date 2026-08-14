import { Module } from "@nestjs/common";

import { ActivityModule } from "../activity/activity.module";
import { AuthModule } from "../auth/auth.module";
import { ProfileModule } from "../profile/profile.module";
import { UserController } from "./controllers/user.controller";
import { UserRepository } from "./repositories/user.repository";
import { UserService } from "./services/user.service";
import { UserValidator } from "./validators/user.validator";

@Module({
  imports: [ActivityModule, AuthModule, ProfileModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserValidator],
  exports: [UserService, UserRepository],
})
export class UserModule {}
