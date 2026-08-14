import { IsOptional, IsString, MaxLength } from "class-validator";

export class MonitoringQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  component?: string;
}
