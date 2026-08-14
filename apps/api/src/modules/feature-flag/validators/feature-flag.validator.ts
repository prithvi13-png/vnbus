import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class FeatureFlagValidator {
  ensureFound<T>(value: T | null | undefined): asserts value is T {
    if (!value) {
      throw new NotFoundException("Feature flag not found");
    }
  }
}
