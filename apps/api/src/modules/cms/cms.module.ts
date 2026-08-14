import { Module } from "@nestjs/common";

import { CmsController } from "./controllers/cms.controller";
import { CmsRepository } from "./repositories/cms.repository";
import { CmsService } from "./services/cms.service";
import { CmsModuleValidator } from "./validators/cms.validator";

@Module({
  controllers: [CmsController],
  providers: [CmsService, CmsRepository, CmsModuleValidator],
  exports: [CmsService],
})
export class CmsModule {}
