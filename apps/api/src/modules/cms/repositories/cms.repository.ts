import { Injectable } from "@nestjs/common";
import type { CmsPageRecord, CreateCmsPageRequest, UpdateCmsPageRequest } from "@vnbus/types";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "cms",
  boundedContext: "Content management",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
    {
      name: "Page content",
      description: "Manage editorial content for customer-facing screens.",
    },
    {
      name: "Banner placements",
      description: "Prepare merchandising and announcement slots.",
    },
    {
      name: "SEO metadata",
      description: "Keep route-level metadata ready for public pages.",
    },
  ],
} satisfies ModuleSummary;

@Injectable()
export class CmsRepository {
  private readonly pages = new Map<string, CmsPageRecord>(
    seedPages().map((page) => [page.pageId, page]),
  );

  findSummary(): ModuleSummary {
    return summary;
  }

  listPages(): CmsPageRecord[] {
    return [...this.pages.values()].sort((left, right) => left.key.localeCompare(right.key));
  }

  createPage(input: CreateCmsPageRequest): CmsPageRecord {
    const now = new Date().toISOString();
    const page: CmsPageRecord = {
      pageId: `CMS-${input.key.toUpperCase().replaceAll(/[^A-Z0-9]+/gu, "-")}`,
      key: input.key,
      title: input.title,
      section: input.section,
      status: "DRAFT",
      content: input.content,
      seoTitle: input.seoTitle ?? input.title,
      seoDescription: input.seoDescription ?? input.content.slice(0, 160),
      updatedBy: "admin",
      publishedAt: null,
      updatedAt: now,
    };
    this.pages.set(page.pageId, page);

    return page;
  }

  updatePage(pageId: string, input: UpdateCmsPageRequest): CmsPageRecord | null {
    const existing = this.findPage(pageId);
    if (!existing) {
      return null;
    }

    const updated: CmsPageRecord = {
      ...existing,
      ...input,
      updatedBy: "admin",
      updatedAt: new Date().toISOString(),
    };
    this.pages.set(updated.pageId, updated);

    return updated;
  }

  publishPage(pageId: string): CmsPageRecord | null {
    const existing = this.findPage(pageId);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    const updated: CmsPageRecord = {
      ...existing,
      status: "PUBLISHED",
      publishedAt: now,
      updatedAt: now,
      updatedBy: "admin",
    };
    this.pages.set(updated.pageId, updated);

    return updated;
  }

  findPage(pageId: string): CmsPageRecord | null {
    return (
      this.pages.get(pageId) ??
      this.listPages().find((page) => page.key === pageId || page.section === pageId) ??
      null
    );
  }
}

function seedPages(): CmsPageRecord[] {
  const now = "2026-08-08T08:00:00.000Z";

  return [
    page("CMS-HOME-BANNER", "home-banner", "Home Banner", "HOME_BANNER", "PUBLISHED", now),
    page("CMS-ABOUT", "about-us", "About Us", "ABOUT_US", "PUBLISHED", now),
    page("CMS-PRIVACY", "privacy-policy", "Privacy Policy", "PRIVACY_POLICY", "PUBLISHED", now),
    page("CMS-TERMS", "terms", "Terms & Conditions", "TERMS", "PUBLISHED", now),
    page("CMS-REFUND", "refund-policy", "Refund Policy", "REFUND_POLICY", "DRAFT", now),
    page("CMS-FAQ", "faq", "FAQ", "FAQ", "PUBLISHED", now),
    page("CMS-CONTACT", "contact", "Contact Page", "CONTACT", "PUBLISHED", now),
    page("CMS-BLOG", "blog", "Blog Placeholder", "BLOG", "DRAFT", now),
    page(
      "CMS-SEO-BLR-HYD",
      "seo-bangalore-hyderabad",
      "Bangalore Hyderabad SEO",
      "SEO",
      "DRAFT",
      now,
    ),
  ];
}

function page(
  pageId: string,
  key: string,
  title: string,
  section: CmsPageRecord["section"],
  status: CmsPageRecord["status"],
  updatedAt: string,
): CmsPageRecord {
  return {
    pageId,
    key,
    title,
    section,
    status,
    content: `${title} content managed from the enterprise admin portal.`,
    seoTitle: `${title} | Vriddhi Nexus`,
    seoDescription: `${title} metadata prepared for the mock admin CMS workflow.`,
    updatedBy: "admin",
    publishedAt: status === "PUBLISHED" ? updatedAt : null,
    updatedAt,
  };
}
