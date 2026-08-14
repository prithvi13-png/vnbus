import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsJWT, IsOptional } from "class-validator";

export class LogoutDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsJWT()
  refreshToken?: string;
}
