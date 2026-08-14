import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import type { Response } from "express";
import { Observable, tap } from "rxjs";

import { ActivityService } from "../../modules/activity/services/activity.service";
import { getRequestContext } from "../http/request-context";
import type { AuthenticatedRequest } from "../security/interfaces/authenticated-request.interface";

const loggedMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

@Injectable()
export class ActivityLoggingInterceptor implements NestInterceptor {
  constructor(private readonly activityService: ActivityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        if (!loggedMethods.has(request.method)) {
          return;
        }

        void this.activityService.record({
          actorType: request.user ? "USER" : "SYSTEM",
          ...(request.user?.sub ? { actorUserId: request.user.sub } : {}),
          action: `${request.method.toLowerCase()}.${request.path}`,
          message: `${request.method} ${request.originalUrl} completed with ${response.statusCode}`,
          entityType: "http_request",
          entityId: request.originalUrl,
          ...getRequestContext(request),
          metadata: {
            statusCode: response.statusCode,
          },
        });
      }),
    );
  }
}
