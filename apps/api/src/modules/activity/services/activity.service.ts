import { Injectable, Logger } from "@nestjs/common";

import type { ListActivityQueryDto } from "../dto/list-activity-query.dto";
import { ActivityMapper } from "../mappers/activity.mapper";
import { ActivityRepository } from "../repositories/activity.repository";
import { ActivityValidator } from "../validators/activity.validator";
import type { ActivityLogDto } from "../dto/activity-log.dto";
import type { ActivityLogInput } from "../interfaces/activity-log-input.interface";

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    private readonly repository: ActivityRepository,
    private readonly validator: ActivityValidator,
  ) {}

  async record(input: ActivityLogInput): Promise<void> {
    try {
      this.validator.ensureValid(input);
      await this.repository.create(input);
    } catch (error) {
      this.logger.warn(
        JSON.stringify({
          event: "activity.log_failed",
          reason: error instanceof Error ? error.message : "Unknown error",
          action: input.action,
        }),
      );
    }
  }

  async list(query: ListActivityQueryDto): Promise<ActivityLogDto[]> {
    const activities = await this.repository.findMany(query);

    return activities.map((activity) => ActivityMapper.toDto(ActivityMapper.toEntity(activity)));
  }
}
