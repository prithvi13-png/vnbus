import { IsArray, IsBoolean, IsObject, IsOptional, IsString, MaxLength } from "class-validator";
import type {
  AdminEmailTemplatePreviewRequest,
  UpdateAdminEmailTemplateRequest,
} from "@vnbus/types";

export class UpdateAdminEmailTemplateDto implements UpdateAdminEmailTemplateRequest {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  subject?: string;

  @IsOptional()
  @IsString()
  htmlBody?: string;

  @IsOptional()
  @IsString()
  textBody?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AdminEmailTemplatePreviewDto implements AdminEmailTemplatePreviewRequest {
  @IsObject()
  variables: Record<string, string>;
}
