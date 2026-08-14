import { Body, Controller, Get, Patch, Req, UnauthorizedException } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { getRequestContext } from "../../../shared/http/request-context";
import { Permissions } from "../../../shared/security/decorators/permissions.decorator";
import type { AuthenticatedRequest } from "../../../shared/security/interfaces/authenticated-request.interface";
import { ProfileDto } from "../dto/profile.dto";
import { UpdateProfileDto } from "../dto/update-profile.dto";
import { ProfileService } from "../services/profile.service";

@ApiTags("Profile")
@ApiBearerAuth()
@Controller("profile")
export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  @Permissions("profile.view")
  @Get()
  get(@Req() request: AuthenticatedRequest): Promise<ProfileDto> {
    return this.service.get(this.requireUserId(request));
  }

  @Permissions("profile.update")
  @Patch()
  update(@Body() dto: UpdateProfileDto, @Req() request: AuthenticatedRequest): Promise<ProfileDto> {
    return this.service.update(this.requireUserId(request), dto, getRequestContext(request));
  }

  private requireUserId(request: AuthenticatedRequest): string {
    if (!request.user?.sub) {
      throw new UnauthorizedException("Missing authenticated user");
    }

    return request.user.sub;
  }
}
