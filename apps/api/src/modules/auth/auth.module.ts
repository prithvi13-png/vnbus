import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { ActivityModule } from "../activity/activity.module";
import { AuthController } from "./controllers/auth.controller";
import { AuthRepository } from "./repositories/auth.repository";
import { AuthService } from "./services/auth.service";
import { PasswordService } from "./services/password.service";
import { durationToSeconds } from "../../shared/utils/duration";
import { PasswordsMatchConstraint } from "./validators/password-confirmation.validator";

@Module({
  imports: [
    ActivityModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        signOptions: {
          expiresIn: durationToSeconds(config.getOrThrow<string>("JWT_ACCESS_TTL"), 900),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, PasswordService, PasswordsMatchConstraint],
  exports: [JwtModule, AuthService, PasswordService],
})
export class AuthModule {}
