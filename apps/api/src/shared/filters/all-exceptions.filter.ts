import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";
import type { Request } from "express";

import { ObservabilityMetricsStore } from "../observability/metrics-store";

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}

type CorrelatedRequest = Request & {
  correlationId?: string;
  requestId?: string;
  traceId?: string;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<CorrelatedRequest>();
    const startedAt = Number(response.getHeader("x-response-started-at") ?? Date.now());
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;
    const body: ErrorResponseBody =
      typeof exceptionResponse === "object" && exceptionResponse !== null
        ? (exceptionResponse as ErrorResponseBody)
        : {
            statusCode: status,
            message: exception instanceof Error ? exception.message : "Internal server error",
          };
    const productionSafeMessage =
      status >= 500 ? "Internal server error" : (body.message ?? "Request failed");

    ObservabilityMetricsStore.recordRequest({
      durationMs: Math.max(Date.now() - startedAt, 0),
      statusCode: status,
    });

    if (status >= 500) {
      this.logger.error(
        JSON.stringify({
          event: "api.request.failed",
          correlationId: request.correlationId,
          requestId: request.requestId,
          traceId: request.traceId,
          method: request.method,
          path: request.originalUrl,
          statusCode: status,
          errorCode: errorCodeFor(status),
          message: exception instanceof Error ? exception.message : "Unhandled exception",
          stack:
            process.env.NODE_ENV === "production"
              ? undefined
              : exception instanceof Error
                ? exception.stack
                : exception,
        }),
      );
    }

    response.status(status).json({
      statusCode: status,
      errorCode: errorCodeFor(status),
      message: productionSafeMessage,
      error: status >= 500 ? "Internal Server Error" : body.error,
      path: request.originalUrl,
      method: request.method,
      correlationId: request.correlationId,
      requestId: request.requestId,
      traceId: request.traceId,
      timestamp: new Date().toISOString(),
    });
  }
}

function errorCodeFor(status: number): string {
  if (status === 400) {
    return "VALIDATION_ERROR";
  }

  if (status === 401) {
    return "AUTHENTICATION_ERROR";
  }

  if (status === 403) {
    return "AUTHORIZATION_ERROR";
  }

  if (status >= 400 && status < 500) {
    return "BUSINESS_RULE_ERROR";
  }

  return "UNKNOWN_ERROR";
}
