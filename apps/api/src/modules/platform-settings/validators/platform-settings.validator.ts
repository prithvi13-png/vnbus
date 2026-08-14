import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class PlatformSettingsValidator {
  ensureFound<T>(value: T | null | undefined): asserts value is T {
    if (!value) {
      throw new NotFoundException("Platform setting not found");
    }
  }
}
