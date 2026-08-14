import { Module } from "@nestjs/common";

import { CacheController } from "./controllers/cache.controller";
import { CacheRepository } from "./repositories/cache.repository";
import { CacheService } from "./services/cache.service";
import { CacheValidator } from "./validators/cache.validator";

@Module({
  controllers: [CacheController],
  providers: [CacheService, CacheRepository, CacheValidator],
  exports: [CacheService],
})
export class CacheModule {}
