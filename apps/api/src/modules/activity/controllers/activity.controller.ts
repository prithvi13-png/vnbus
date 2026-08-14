import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { Permissions } from "../../../shared/security/decorators/permissions.decorator";
import { ActivityLogDto } from "../dto/activity-log.dto";
import { ListActivityQueryDto } from "../dto/list-activity-query.dto";
import { ActivityService } from "../services/activity.service";

@ApiTags("Activity")
@ApiBearerAuth()
@Controller("activity")
export class ActivityController {
  constructor(private readonly service: ActivityService) {}

  @Permissions("activity.view")
  @Get()
  list(@Query() query: ListActivityQueryDto): Promise<ActivityLogDto[]> {
    return this.service.list(query);
  }
}
