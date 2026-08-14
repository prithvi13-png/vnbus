import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { SeoMetadataRecord, SeoSitemapResponse } from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { SeoQueryDto } from "../dto/seo-query.dto";
import { SeoService } from "../services/seo.service";

@ApiTags("SEO")
@Controller("seo")
export class SeoController {
  constructor(private readonly service: SeoService) {}

  @Public()
  @Get("metadata")
  @ApiOkResponse({ description: "Dynamic metadata, OpenGraph, Twitter, JSON-LD, and breadcrumbs" })
  getMetadata(@Query() query: SeoQueryDto): SeoMetadataRecord {
    return this.service.getMetadata(query.path);
  }

  @Public()
  @Get("sitemap")
  @ApiOkResponse({ description: "SEO sitemap route records and robots content" })
  getSitemap(): SeoSitemapResponse {
    return this.service.getSitemap();
  }
}
