import { IsString } from "class-validator";
import type { RecordRecentSearchRequest } from "@vnbus/types";

export class RecordRecentSearchDto implements RecordRecentSearchRequest {
  @IsString()
  sourceCity!: string;

  @IsString()
  destinationCity!: string;
}
