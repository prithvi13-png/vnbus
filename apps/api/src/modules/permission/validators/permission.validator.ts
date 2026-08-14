import { Injectable } from "@nestjs/common";

@Injectable()
export class PermissionValidator {
  ensureCodeFormat(code: string): void {
    if (!/^[a-z]+(\.[a-z]+)+$/u.test(code)) {
      throw new Error("Permission code must use resource.action format");
    }
  }
}
