import { IsOptional, IsString } from "class-validator";

export class SeoQueryDto {
  @IsOptional()
  @IsString()
  path?: string;
}
