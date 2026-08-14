import { Injectable } from "@nestjs/common";
import type { SeoMetadataRecord, SeoSitemapResponse } from "@vnbus/types";

const baseUrl = "https://www.vriddhinexus.com";
const ogImage = `${baseUrl}/og/bus-booking.png`;

@Injectable()
export class SeoRepository {
  private readonly routes = seedRoutes();

  getMetadata(path = "/"): SeoMetadataRecord {
    return this.routes.find((route) => route.path === path) ?? metadata(path, "Bus Booking");
  }

  getSitemap(): SeoSitemapResponse {
    return {
      routes: this.routes,
      robots: [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin",
        "Disallow: /agent",
        `Sitemap: ${baseUrl}/sitemap.xml`,
      ].join("\n"),
      generatedAt: new Date().toISOString(),
    };
  }
}

function seedRoutes(): SeoMetadataRecord[] {
  return [
    metadata("/", "Vriddhi Nexus Bus Booking"),
    metadata("/search", "Search Bus Routes"),
    metadata("/booking-history", "Booking History"),
    metadata("/notifications", "Notification Center"),
    metadata("/privacy", "Privacy Policy"),
    metadata("/terms", "Terms of Service"),
  ];
}

function metadata(path: string, title: string): SeoMetadataRecord {
  const fullTitle = `${title} | Vriddhi Nexus Bus`;
  const description =
    "Enterprise bus booking platform for search, ticketing, notifications, and operational workflows.";
  const canonicalUrl = `${baseUrl}${path}`;

  return {
    path,
    title: fullTitle,
    description,
    canonicalUrl,
    openGraph: {
      title: fullTitle,
      description,
      image: ogImage,
    },
    twitterCard: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: fullTitle,
      url: canonicalUrl,
      description,
    },
    breadcrumbs: [
      {
        name: "Home",
        item: baseUrl,
      },
      {
        name: title,
        item: canonicalUrl,
      },
    ],
  };
}
