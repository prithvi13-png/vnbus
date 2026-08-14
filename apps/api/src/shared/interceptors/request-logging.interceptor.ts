import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { Observable, tap } from "rxjs";

import { ObservabilityMetricsStore } from "../observability/metrics-store";

type CorrelatedRequest = Request & {
  correlationId?: string;
  requestId?: string;
  traceId?: string;
};

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<CorrelatedRequest>();
    const response = context.switchToHttp().getResponse<Response>();
    const startedAt = Date.now();
    const correlationId = headerValue(request.headers["x-correlation-id"]) ?? randomUUID();
    const requestId = headerValue(request.headers["x-request-id"]) ?? randomUUID();
    const traceId = headerValue(request.headers["x-trace-id"]) ?? randomUUID();

    request.correlationId = correlationId;
    request.requestId = requestId;
    request.traceId = traceId;
    response.setHeader("x-correlation-id", correlationId);
    response.setHeader("x-request-id", requestId);
    response.setHeader("x-trace-id", traceId);
    response.setHeader("x-response-started-at", String(startedAt));

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startedAt;
        ObservabilityMetricsStore.recordRequest({
          durationMs,
          statusCode: response.statusCode,
        });

        this.logger.log(
          JSON.stringify({
            event: "api.request.completed",
            correlationId,
            requestId,
            traceId,
            method: request.method,
            path: request.originalUrl,
            statusCode: response.statusCode,
            durationMs,
          }),
        );
      }),
    );
  }
}

function headerValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
