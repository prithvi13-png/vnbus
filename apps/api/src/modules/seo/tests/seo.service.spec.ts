import { SeoRepository } from "../repositories/seo.repository";
import { SeoService } from "../services/seo.service";
import { SeoValidator } from "../validators/seo.validator";

describe("SeoService", () => {
  it("returns metadata and sitemap records", () => {
    const service = new SeoService(new SeoRepository(), new SeoValidator());
    const metadata = service.getMetadata("/search");
    const sitemap = service.getSitemap();

    expect(metadata.openGraph.image).toContain("og");
    expect(metadata.twitterCard.card).toBe("summary_large_image");
    expect(sitemap.robots).toContain("Sitemap:");
  });
});
