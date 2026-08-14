import { IsIn, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import type { AgentReportPeriod } from "@vnbus/types";

const periods: AgentReportPeriod[] = ["DAILY", "WEEKLY", "MONTHLY"];

export class AgentReportQueryDto {
  @ApiPropertyOptional({ enum: periods })
  @IsOptional()
  @IsIn(periods)
  period?: AgentReportPeriod;
}
