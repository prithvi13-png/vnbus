import { IsString } from "class-validator";

export class RunJobDto {
  @IsString()
  jobId!: string;
}
