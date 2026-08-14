import type { SeoMetadataRecord, SeoSitemapResponse } from "@vnbus/types";

export class SeoMetadataEntity implements SeoMetadataRecord {
  constructor(private readonly record: SeoMetadataRecord) {}

  get path(): string {
    return this.record.path;
  }

  get title(): string {
    return this.record.title;
  }

  get description(): string {
    return this.record.description;
  }

  get canonicalUrl(): string {
    return this.record.canonicalUrl;
  }

  get openGraph(): SeoMetadataRecord["openGraph"] {
    return this.record.openGraph;
  }

  get twitterCard(): SeoMetadataRecord["twitterCard"] {
    return this.record.twitterCard;
  }

  get jsonLd(): SeoMetadataRecord["jsonLd"] {
    return this.record.jsonLd;
  }

  get breadcrumbs(): SeoMetadataRecord["breadcrumbs"] {
    return this.record.breadcrumbs;
  }
}

export class SeoSitemapEntity implements SeoSitemapResponse {
  constructor(private readonly record: SeoSitemapResponse) {}

  get routes(): SeoSitemapResponse["routes"] {
    return this.record.routes;
  }

  get robots(): string {
    return this.record.robots;
  }

  get generatedAt(): string {
    return this.record.generatedAt;
  }
}
