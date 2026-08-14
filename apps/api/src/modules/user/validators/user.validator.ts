import { Injectable, UnprocessableEntityException } from "@nestjs/common";

@Injectable()
export class UserValidator {
  normalizeRoleCode(roleCode: string): string {
    return roleCode.trim().toUpperCase();
  }

  ensureRoleExists(roleCode: string, exists: boolean): void {
    if (!exists) {
      throw new UnprocessableEntityException(`Role ${roleCode} does not exist`);
    }
  }
}
