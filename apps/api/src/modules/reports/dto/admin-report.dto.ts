import { IsIn, IsObject, IsOptional } from "class-validator";
import type { AdminReportPeriod, AdminReportType, CreateAdminReportRequest } from "@vnbus/types";

export class CreateAdminReportDto implements CreateAdminReportRequest {
  @IsIn([
    "BOOKINGS",
    "REVENUE",
    "CUSTOMER_GROWTH",
    "AGENT_PERFORMANCE",
    "POPULAR_ROUTES",
    "CANCELLATION_RATE",
  ])
  type: AdminReportType;

  @IsIn(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
  period: AdminReportPeriod;

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;
}
