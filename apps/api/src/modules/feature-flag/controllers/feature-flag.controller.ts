import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { AdminFeatureFlagRecord } from "@vnbus/types";

import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { UpdateFeatureFlagDto } from "../dto/feature-flag.dto";
import { FeatureFlagService } from "../services/feature-flag.service";

@ApiTags("Feature Flags")
@ApiBearerAuth()
@Controller("feature-flags")
export class FeatureFlagController {
  constructor(private readonly service: FeatureFlagService) {}

  @Roles("ADMIN")
  @Get()
  @ApiOkResponse({ description: "Admin feature flag rollout controls" })
  list(): AdminFeatureFlagRecord[] {
    return this.service.list();
  }

  @Roles("ADMIN")
  @Patch(":flagId")
  @ApiOkResponse({ description: "Update feature flag state or rollout percentage" })
  update(
    @Param("flagId") flagId: string,
    @Body() dto: UpdateFeatureFlagDto,
  ): AdminFeatureFlagRecord {
    return this.service.update(flagId, dto);
  }
}
