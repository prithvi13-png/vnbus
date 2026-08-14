import { CmsRepository } from "../repositories/cms.repository";
import { CmsService } from "../services/cms.service";
import { CmsModuleValidator } from "../validators/cms.validator";

describe("CmsService", () => {
  it("returns module readiness and capabilities", () => {
    const service = new CmsService(new CmsRepository(), new CmsModuleValidator());
    const summary = service.getSummary();

    expect(summary.module).toBe("cms");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });

  it("manages CMS pages and publishing", () => {
    const service = new CmsService(new CmsRepository(), new CmsModuleValidator());
    const draft = service.createPage({
      key: "seo-pune-goa",
      title: "Pune to Goa SEO",
      section: "SEO",
      content: "SEO landing copy for Pune to Goa mock route.",
    });
    const updated = service.updatePage(draft.pageId, {
      seoTitle: "Pune to Goa Bus Tickets",
    });
    const published = service.publishPage(draft.pageId);

    expect(service.listPages().length).toBeGreaterThan(8);
    expect(updated.seoTitle).toBe("Pune to Goa Bus Tickets");
    expect(published.status).toBe("PUBLISHED");
  });
});
