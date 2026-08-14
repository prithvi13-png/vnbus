import { Injectable } from "@nestjs/common";
import type { SeoMetadataRecord, SeoSitemapResponse } from "@vnbus/types";

import { SeoRepository } from "../repositories/seo.repository";
import { SeoValidator } from "../validators/seo.validator";

@Injectable()
export class SeoService {
  constructor(
    private readonly repository: SeoRepository,
    private readonly validator: SeoValidator,
  ) {}

  getMetadata(path?: string): SeoMetadataRecord {
    const metadata = this.repository.getMetadata(path);
    this.validator.ensureMetadata(metadata);

    return metadata;
  }

  getSitemap(): SeoSitemapResponse {
    const sitemap = this.repository.getSitemap();
    this.validator.ensureSitemap(sitemap);

    return sitemap;
  }
}
