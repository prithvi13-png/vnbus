import { Injectable } from "@nestjs/common";
import type { CmsPageRecord } from "@vnbus/types";

import type { CreateCmsPageDto, UpdateCmsPageDto } from "../dto/cms-page.dto";
import { CmsSummaryDto } from "../dto/cms-summary.dto";
import type { CmsModulePort } from "../interfaces/cms.interface";
import { CmsRepository } from "../repositories/cms.repository";
import { CmsModuleValidator } from "../validators/cms.validator";

@Injectable()
export class CmsService implements CmsModulePort {
  constructor(
    private readonly repository: CmsRepository,
    private readonly validator: CmsModuleValidator,
  ) {}

  getSummary(): CmsSummaryDto {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new CmsSummaryDto(summary);
  }

  listPages(): CmsPageRecord[] {
    return this.repository.listPages();
  }

  createPage(dto: CreateCmsPageDto): CmsPageRecord {
    return this.repository.createPage(dto);
  }

  updatePage(pageId: string, dto: UpdateCmsPageDto): CmsPageRecord {
    const page = this.repository.updatePage(pageId, dto);
    this.validator.ensureFound(page, "CMS page");

    return page;
  }

  publishPage(pageId: string): CmsPageRecord {
    const page = this.repository.publishPage(pageId);
    this.validator.ensureFound(page, "CMS page");

    return page;
  }
}
