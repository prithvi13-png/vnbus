import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { CacheDashboardResponse } from "@vnbus/types";

import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { WarmCacheDto } from "../dto/cache-warm.dto";
import { CacheService } from "../services/cache.service";

@ApiTags("Cache")
@ApiBearerAuth()
@Controller("cache")
export class CacheController {
  constructor(private readonly service: CacheService) {}

  @Roles("ADMIN")
  @Get()
  @ApiOkResponse({ description: "Redis cache status and strategy" })
  getDashboard(): CacheDashboardResponse {
    return this.service.getDashboard();
  }

  @Roles("ADMIN")
  @Post("warm")
  @ApiOkResponse({ description: "Warm selected Redis cache namespaces" })
  warm(@Body() dto: WarmCacheDto): CacheDashboardResponse {
    return this.service.warm(dto.namespaces);
  }
}
