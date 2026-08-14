import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { CmsPageRecord } from "@vnbus/types";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { CreateCmsPageDto, UpdateCmsPageDto } from "../dto/cms-page.dto";
import { CmsSummaryDto } from "../dto/cms-summary.dto";
import { CmsService } from "../services/cms.service";

@ApiTags("Cms")
@ApiBearerAuth()
@Controller("cms")
export class CmsController {
  constructor(private readonly service: CmsService) {}

  @Public()
  @Get("health")
  getHealth(): CmsSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("capabilities")
  getCapabilities(): CmsSummaryDto {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("pages")
  @ApiOkResponse({ description: "Admin CMS pages for banners, policies, FAQ, blog, and SEO" })
  listPages(): CmsPageRecord[] {
    return this.service.listPages();
  }

  @Roles("ADMIN")
  @Post("pages")
  @ApiOkResponse({ description: "Create CMS page draft" })
  createPage(@Body() dto: CreateCmsPageDto): CmsPageRecord {
    return this.service.createPage(dto);
  }

  @Roles("ADMIN")
  @Patch("pages/:pageId")
  @ApiOkResponse({ description: "Edit CMS page content and SEO fields" })
  updatePage(@Param("pageId") pageId: string, @Body() dto: UpdateCmsPageDto): CmsPageRecord {
    return this.service.updatePage(pageId, dto);
  }

  @Roles("ADMIN")
  @Post("pages/:pageId/publish")
  @ApiOkResponse({ description: "Publish CMS page" })
  publishPage(@Param("pageId") pageId: string): CmsPageRecord {
    return this.service.publishPage(pageId);
  }
}
