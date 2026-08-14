import { Injectable } from "@nestjs/common";

import type { UpdateProfileDto } from "../dto/update-profile.dto";

@Injectable()
export class ProfileValidator {
  normalize(input: UpdateProfileDto): UpdateProfileDto {
    const normalized: UpdateProfileDto = {};

    if (input.firstName !== undefined) {
      normalized.firstName = input.firstName.trim();
    }

    if (input.lastName !== undefined) {
      normalized.lastName = input.lastName.trim();
    }

    if (input.phone !== undefined) {
      normalized.phone = input.phone.trim();
    }

    if (input.avatar !== undefined) {
      normalized.avatar = input.avatar.trim();
    }

    return normalized;
  }
}
