import type { ArgumentsHost } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { AllExceptionsFilter } from "./all-exceptions.filter";

describe("AllExceptionsFilter", () => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });

  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ getHeader: () => Date.now(), status }),
      getRequest: () => ({
        method: "POST",
        originalUrl: "/api/v1/auth/register",
        correlationId: "corr-1",
      }),
    }),
  } as unknown as ArgumentsHost;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function uniqueViolation(target: unknown): Prisma.PrismaClientKnownRequestError {
    return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
      code: "P2002",
      clientVersion: "6.13.0",
      meta: { target },
    });
  }

  it("answers a unique-constraint violation with a 409 naming the field", () => {
    new AllExceptionsFilter().catch(uniqueViolation(["phone"]), host);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        errorCode: "BUSINESS_RULE_ERROR",
        message: "phone already in use",
      }),
    );
  });

  it("reads the field out of a PostgreSQL index name", () => {
    new AllExceptionsFilter().catch(uniqueViolation("User_phone_key"), host);

    expect(json).toHaveBeenCalledWith(expect.objectContaining({ message: "phone already in use" }));
  });

  it("still reports unrelated failures as a masked 500", () => {
    new AllExceptionsFilter().catch(new Error("connection reset"), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 500, message: "Internal server error" }),
    );
  });
});
