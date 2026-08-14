import type { ModuleSummary } from "../../../shared/domain/module-summary";
import type { CmsPageRecord } from "@vnbus/types";

export class CmsContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number,
  ) {}

  static fromSummary(summary: ModuleSummary): CmsContextEntity {
    return new CmsContextEntity(
      summary.module,
      summary.boundedContext,
      summary.capabilities.length,
    );
  }
}

export class CmsPageEntity {
  constructor(readonly page: CmsPageRecord) {}
}
