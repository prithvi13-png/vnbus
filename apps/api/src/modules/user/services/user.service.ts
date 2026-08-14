import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import { ActivityService } from "../../activity/services/activity.service";
import { PasswordService } from "../../auth/services/password.service";
import type { RequestContext } from "../../../shared/http/request-context";
import type { CreateUserDto } from "../dto/create-user.dto";
import type { ListUsersQueryDto } from "../dto/list-users-query.dto";
import type { UpdateUserDto } from "../dto/update-user.dto";
import { UserDto } from "../dto/user.dto";
import { UserMapper } from "../mappers/user.mapper";
import { UserRepository } from "../repositories/user.repository";
import { UserValidator } from "../validators/user.validator";

@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly validator: UserValidator,
    private readonly activity: ActivityService,
  ) {}

  async list(query: ListUsersQueryDto): Promise<UserDto[]> {
    const users = await this.repository.findMany(query);

    return users.map((user) => UserMapper.toDto(UserMapper.toEntity(user)));
  }

  async getCurrentUser(userId: string): Promise<UserDto> {
    return this.getById(userId);
  }

  async getById(id: string): Promise<UserDto> {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return UserMapper.toDto(UserMapper.toEntity(user));
  }

  async create(
    dto: CreateUserDto,
    actorUserId?: string,
    context?: RequestContext,
  ): Promise<UserDto> {
    const normalized = {
      ...dto,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email.toLowerCase(),
      phone: dto.phone.trim(),
      roleCode: this.validator.normalizeRoleCode(dto.roleCode),
    };

    await this.ensureUniqueEmail(normalized.email);
    await this.ensureUniquePhone(normalized.phone);

    const role = await this.repository.findRoleByCode(normalized.roleCode);
    this.validator.ensureRoleExists(normalized.roleCode, Boolean(role));

    const passwordHash = await this.passwordService.hashPassword(normalized.password);
    const user = await this.repository.create(normalized, passwordHash, role!.id);

    await this.activity.record({
      actorType: actorUserId ? "USER" : "SYSTEM",
      ...(actorUserId ? { actorUserId } : {}),
      action: "users.create",
      message: "User account created",
      entityType: "user",
      entityId: user.id,
      ...context,
    });

    return UserMapper.toDto(UserMapper.toEntity(user));
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    actorUserId?: string,
    context?: RequestContext,
  ): Promise<UserDto> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException("User not found");
    }

    const normalized = this.normalizeUpdateDto(dto);

    if (normalized.email && normalized.email !== existing.email) {
      await this.ensureUniqueEmail(normalized.email, id);
    }

    if (normalized.phone && normalized.phone !== existing.phone) {
      await this.ensureUniquePhone(normalized.phone, id);
    }

    const roleCode = normalized.roleCode
      ? this.validator.normalizeRoleCode(normalized.roleCode)
      : undefined;
    const role = roleCode ? await this.repository.findRoleByCode(roleCode) : null;

    if (roleCode) {
      this.validator.ensureRoleExists(roleCode, Boolean(role));
      normalized.roleCode = roleCode;
    }

    const user = await this.repository.update(id, normalized, role?.id);

    await this.activity.record({
      actorType: actorUserId ? "USER" : "SYSTEM",
      ...(actorUserId ? { actorUserId } : {}),
      action: "users.update",
      message: "User account updated",
      entityType: "user",
      entityId: user.id,
      ...context,
    });

    return UserMapper.toDto(UserMapper.toEntity(user));
  }

  async delete(id: string, actorUserId?: string, context?: RequestContext): Promise<UserDto> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException("User not found");
    }

    const user = await this.repository.softDelete(id);

    await this.activity.record({
      actorType: actorUserId ? "USER" : "SYSTEM",
      ...(actorUserId ? { actorUserId } : {}),
      action: "users.delete",
      message: "User account soft deleted",
      entityType: "user",
      entityId: user.id,
      ...context,
    });

    return UserMapper.toDto(UserMapper.toEntity(user));
  }

  private normalizeUpdateDto(dto: UpdateUserDto): UpdateUserDto {
    const normalized: UpdateUserDto = {};

    if (dto.firstName !== undefined) {
      normalized.firstName = dto.firstName.trim();
    }

    if (dto.lastName !== undefined) {
      normalized.lastName = dto.lastName.trim();
    }

    if (dto.email !== undefined) {
      normalized.email = dto.email.toLowerCase();
    }

    if (dto.phone !== undefined) {
      normalized.phone = dto.phone.trim();
    }

    if (dto.avatar !== undefined) {
      normalized.avatar = dto.avatar.trim();
    }

    if (dto.roleCode !== undefined) {
      normalized.roleCode = dto.roleCode.trim();
    }

    if (dto.status !== undefined) {
      normalized.status = dto.status;
    }

    if (dto.emailVerified !== undefined) {
      normalized.emailVerified = dto.emailVerified;
    }

    if (dto.forcePasswordChange !== undefined) {
      normalized.forcePasswordChange = dto.forcePasswordChange;
    }

    return normalized;
  }

  private async ensureUniqueEmail(email: string, allowedUserId?: string): Promise<void> {
    const existing = await this.repository.findByEmail(email, true);

    if (existing && existing.id !== allowedUserId) {
      throw new ConflictException("Email is already registered");
    }
  }

  private async ensureUniquePhone(phone: string, allowedUserId?: string): Promise<void> {
    const existing = await this.repository.findByPhone(phone, true);

    if (existing && existing.id !== allowedUserId) {
      throw new ConflictException("Phone is already registered");
    }
  }
}
