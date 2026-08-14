import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { Injectable } from "@nestjs/common";
import argon2 from "argon2";

@Injectable()
export class PasswordService {
  hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65_536,
      timeCost: 3,
      parallelism: 1,
    });
  }

  verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return argon2.verify(passwordHash, password);
  }

  createSecureToken(byteLength = 48): string {
    return randomBytes(byteLength).toString("base64url");
  }

  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  tokensEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
  }
}
