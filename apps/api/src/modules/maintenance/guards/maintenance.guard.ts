import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import type { Request } from "express";

import { MaintenanceService } from "../services/maintenance.service";

const allowedDuringMaintenance = [
  "/api/v1/health",
  "/api/v1/maintenance",
  "/api/v1/auth",
  "/api/v1/admin",
  "/api/docs",
];

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(private readonly maintenance: MaintenanceService) {}

  canActivate(context: ExecutionContext): boolean {
    const status = this.maintenance.getStatus();
    if (!status.enabled) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const path = request.originalUrl ?? request.url;
    const isAllowed = allowedDuringMaintenance.some((allowedPath) => path.startsWith(allowedPath));

    if (isAllowed) {
      return true;
    }

    throw new ServiceUnavailableException({
      statusCode: 503,
      errorCode: "MAINTENANCE_MODE",
      message: status.message,
    });
  }
}
