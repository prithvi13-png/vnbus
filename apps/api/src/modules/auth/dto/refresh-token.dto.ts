import { ApiProperty } from "@nestjs/swagger";
import { IsJWT, IsOptional } from "class-validator";

export class RefreshTokenDto {
  @ApiProperty()
  @IsOptional()
  @IsJWT()
  refreshToken?: string;
}
