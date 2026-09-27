import type { MetadataRoute } from "next";

const routes = [
  "",
  "/search",
  "/track-bus",
  "/booking-history",
  "/support",
  "/notifications",
  "/faq",
  "/privacy",
  "/terms",
  "/cancellation-policy",
  "/refund-policy",
  "/login",
  "/register",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((route) => ({
    url: `https://www.vriddhinexus.com${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/search" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/search" ? 0.9 : 0.7,
  }));
}
