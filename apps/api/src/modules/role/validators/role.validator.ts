import { Injectable } from "@nestjs/common";

@Injectable()
export class RoleValidator {
  ensureKnownSystemRole(code: string): void {
    if (!["CUSTOMER", "TRAVEL_AGENT", "ADMIN"].includes(code)) {
      throw new Error("Unknown seeded role");
    }
  }

  ensureRoleCode(code: string): void {
    if (!/^[A-Z][A-Z0-9_]{1,79}$/u.test(code)) {
      throw new Error("Role code must be uppercase and future-role compatible");
    }
  }
}
