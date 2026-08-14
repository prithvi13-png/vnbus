import { Injectable, NotFoundException } from "@nestjs/common";

import { ActivityService } from "../../activity/services/activity.service";
import type { RequestContext } from "../../../shared/http/request-context";
import { ProfileDto } from "../dto/profile.dto";
import type { UpdateProfileDto } from "../dto/update-profile.dto";
import { ProfileMapper } from "../mappers/profile.mapper";
import { ProfileRepository } from "../repositories/profile.repository";
import { ProfileValidator } from "../validators/profile.validator";

@Injectable()
export class ProfileService {
  constructor(
    private readonly repository: ProfileRepository,
    private readonly validator: ProfileValidator,
    private readonly activity: ActivityService,
  ) {}

  async get(userId: string): Promise<ProfileDto> {
    const profile = await this.repository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    return ProfileMapper.toDto(ProfileMapper.toEntity(profile));
  }

  async update(
    userId: string,
    dto: UpdateProfileDto,
    context?: RequestContext,
  ): Promise<ProfileDto> {
    const profile = await this.repository.update(userId, this.validator.normalize(dto));

    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    await this.activity.record({
      actorType: "USER",
      actorUserId: userId,
      action: "profile.update",
      message: "User profile updated",
      entityType: "user",
      entityId: userId,
      ...context,
    });

    return ProfileMapper.toDto(ProfileMapper.toEntity(profile));
  }
}
