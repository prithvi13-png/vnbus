import { BadRequestException, Injectable } from "@nestjs/common";
import type { SeoMetadataRecord, SeoSitemapResponse } from "@vnbus/types";

@Injectable()
export class SeoValidator {
  ensureMetadata(record: SeoMetadataRecord): void {
    if (!record.canonicalUrl || !record.jsonLd["@context"]) {
      throw new BadRequestException("SEO metadata is incomplete.");
    }
  }

  ensureSitemap(response: SeoSitemapResponse): void {
    if (response.routes.length === 0 || !response.robots.includes("Sitemap:")) {
      throw new BadRequestException("SEO sitemap is incomplete.");
    }
  }
}
