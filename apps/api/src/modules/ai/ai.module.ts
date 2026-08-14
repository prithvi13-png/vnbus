import { Module } from "@nestjs/common";

import { AiController } from "./controllers/ai.controller";
import { AiRepository } from "./repositories/ai.repository";
import { AiService } from "./services/ai.service";
import { AiModuleValidator } from "./validators/ai.validator";

@Module({
  controllers: [AiController],
  providers: [AiService, AiRepository, AiModuleValidator],
  exports: [AiService],
})
export class AiModule {}
