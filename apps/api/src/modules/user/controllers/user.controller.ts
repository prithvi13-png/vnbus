import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { ProfileService } from "../../profile/services/profile.service";
import { getRequestContext } from "../../../shared/http/request-context";
import { Permissions } from "../../../shared/security/decorators/permissions.decorator";
import type { AuthenticatedRequest } from "../../../shared/security/interfaces/authenticated-request.interface";
import { UpdateProfileDto } from "../../profile/dto/update-profile.dto";
import type { ProfileDto } from "../../profile/dto/profile.dto";
import { CreateUserDto } from "../dto/create-user.dto";
import { ListUsersQueryDto } from "../dto/list-users-query.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { UserDto } from "../dto/user.dto";
import { UserService } from "../services/user.service";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
  ) {}

  @Permissions("profile.view")
  @Get("me")
  getMe(@Req() request: AuthenticatedRequest): Promise<UserDto> {
    return this.userService.getCurrentUser(this.requireUserId(request));
  }

  @Permissions("users.view")
  @Get()
  list(@Query() query: ListUsersQueryDto): Promise<UserDto[]> {
    return this.userService.list(query);
  }

  @Permissions("users.create")
  @Post()
  create(@Body() dto: CreateUserDto, @Req() request: AuthenticatedRequest): Promise<UserDto> {
    return this.userService.create(dto, this.requireUserId(request), getRequestContext(request));
  }

  @Permissions("profile.update")
  @Patch("profile")
  updateProfile(
    @Body() dto: UpdateProfileDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<ProfileDto> {
    return this.profileService.update(this.requireUserId(request), dto, getRequestContext(request));
  }

  @Permissions("users.view")
  @Get(":id")
  getById(@Param("id") id: string): Promise<UserDto> {
    return this.userService.getById(id);
  }

  @Permissions("users.edit")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateUserDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<UserDto> {
    return this.userService.update(
      id,
      dto,
      this.requireUserId(request),
      getRequestContext(request),
    );
  }

  @Permissions("users.delete")
  @Delete(":id")
  delete(@Param("id") id: string, @Req() request: AuthenticatedRequest): Promise<UserDto> {
    return this.userService.delete(id, this.requireUserId(request), getRequestContext(request));
  }

  private requireUserId(request: AuthenticatedRequest): string {
    if (!request.user?.sub) {
      throw new UnauthorizedException("Missing authenticated user");
    }

    return request.user.sub;
  }
}
