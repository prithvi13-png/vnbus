import { Module } from "@nestjs/common";

import { SeoController } from "./controllers/seo.controller";
import { SeoRepository } from "./repositories/seo.repository";
import { SeoService } from "./services/seo.service";
import { SeoValidator } from "./validators/seo.validator";

@Module({
  controllers: [SeoController],
  providers: [SeoService, SeoRepository, SeoValidator],
  exports: [SeoService],
})
export class SeoModule {}
