import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import type { CmsPageRecord, CreateCmsPageRequest, UpdateCmsPageRequest } from "@vnbus/types";

const pageSections: CmsPageRecord["section"][] = [
  "HOME_BANNER",
  "ABOUT_US",
  "PRIVACY_POLICY",
  "TERMS",
  "REFUND_POLICY",
  "FAQ",
  "CONTACT",
  "BLOG",
  "SEO",
];

export class CreateCmsPageDto implements CreateCmsPageRequest {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  key: string;

  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title: string;

  @IsIn(pageSections)
  section: CmsPageRecord["section"];

  @IsString()
  @MinLength(10)
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  seoDescription?: string;
}

export class UpdateCmsPageDto implements UpdateCmsPageRequest {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  seoDescription?: string;

  @IsOptional()
  @IsIn(["DRAFT", "PUBLISHED", "ARCHIVED"])
  status?: CmsPageRecord["status"];
}
