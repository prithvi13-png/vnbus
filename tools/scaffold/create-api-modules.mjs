import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const modules = [
  {
    name: "customer",
    boundedContext: "Customer identity and traveller profile management",
    capabilities: [
      ["Profile lifecycle", "Manage customer profile and contact records."],
      ["Traveller preferences", "Keep traveller-level preferences ready for booking workflows."],
      ["Saved passengers", "Prepare reusable passenger records for faster checkout."],
    ],
  },
  {
    name: "agent",
    boundedContext: "Travel agent operations",
    capabilities: [
      ["Agency onboarding", "Model agent profile and compliance lifecycle."],
      ["Agent-owned bookings", "Keep booking ownership ready for agency workflows."],
      ["Managed customers", "Prepare agent customer relationship records."],
    ],
  },
  {
    name: "admin",
    boundedContext: "Back office administration",
    capabilities: [
      ["Operational control", "Expose administrative views over users, bookings, and settings."],
      ["RBAC stewardship", "Prepare role and permission management surfaces."],
      ["Platform governance", "Centralize enterprise controls for internal teams."],
    ],
  },
  {
    name: "booking",
    boundedContext: "Booking lifecycle",
    capabilities: [
      ["Booking draft", "Represent booking creation before payment confirmation."],
      ["Confirmation records", "Keep supplier PNR and internal booking references separate."],
      ["Cancellation readiness", "Prepare cancellation and reschedule policy boundaries."],
    ],
  },
  {
    name: "search",
    boundedContext: "Trip discovery",
    capabilities: [
      ["Search normalization", "Normalize route, date, passenger, and supplier criteria."],
      ["Supplier aggregation", "Prepare fan-out and merge contracts for future suppliers."],
      ["Result filtering", "Model filters for operator, fare, timing, and amenities."],
    ],
  },
  {
    name: "ticket",
    boundedContext: "Ticket issuance",
    capabilities: [
      ["Ticket records", "Track issued, cancelled, and refunded ticket states."],
      ["PDF handoff", "Prepare generated ticket artifact references without provider coupling."],
      ["Download audit", "Keep ticket download events ready for compliance logging."],
    ],
  },
  {
    name: "seat",
    boundedContext: "Seat inventory and layout",
    capabilities: [
      ["Seat map normalization", "Represent decks, rows, columns, and fare per seat."],
      ["Seat blocking", "Prepare lock expiry and release semantics."],
      ["Availability checks", "Model seat availability without supplier-specific leakage."],
    ],
  },
  {
    name: "tracking",
    boundedContext: "Journey tracking",
    capabilities: [
      ["Tracking abstraction", "Use supplier-neutral trip tracking contracts."],
      ["OpenStreetMap geometry", "Prepare latitude and longitude data for OSM rendering."],
      ["Journey events", "Model stop, delay, and bus movement events."],
    ],
  },
  {
    name: "notification",
    boundedContext: "Notification delivery",
    capabilities: [
      ["Delivery queue", "Prepare asynchronous in-app and email notification jobs."],
      ["Preference checks", "Respect customer and agent notification preferences."],
      ["Template binding", "Connect notifications to email template records."],
    ],
  },
  {
    name: "analytics",
    boundedContext: "Operational analytics",
    capabilities: [
      ["KPI read models", "Prepare booking, search, and revenue metrics."],
      ["Conversion funnel", "Represent search-to-booking journey metrics."],
      ["Role scoped insight", "Separate admin and agent analytics views."],
    ],
  },
  {
    name: "cms",
    boundedContext: "Content management",
    capabilities: [
      ["Page content", "Manage editorial content for customer-facing screens."],
      ["Banner placements", "Prepare merchandising and announcement slots."],
      ["SEO metadata", "Keep route-level metadata ready for public pages."],
    ],
  },
  {
    name: "offers",
    boundedContext: "Offer campaigns",
    capabilities: [
      ["Campaign lifecycle", "Prepare offer publication windows and targeting."],
      ["Eligibility rules", "Model audience, route, and channel eligibility."],
      ["Merchandising surfaces", "Expose offers to search and checkout surfaces."],
    ],
  },
  {
    name: "coupons",
    boundedContext: "Coupon discounts",
    capabilities: [
      ["Coupon validation", "Prepare coupon code eligibility checks."],
      ["Redemption ledger", "Track redemption limits and audit trails."],
      ["Discount rules", "Model fixed and percentage discount constraints."],
    ],
  },
  {
    name: "supplier",
    boundedContext: "Supplier integration boundary",
    capabilities: [
      ["Adapter registry", "Register supplier adapters without direct third-party coupling."],
      ["Adapter selection", "Resolve supplier contracts by code and capability."],
      ["Integration observability", "Prepare health, latency, and failure metrics per supplier."],
    ],
  },
  {
    name: "ai",
    boundedContext: "AI recommendation boundary",
    capabilities: [
      ["Recommendation contracts", "Prepare model-agnostic recommendation interfaces."],
      ["Provider isolation", "Keep future AI providers behind explicit ports."],
      ["Safety policy hooks", "Prepare governance checks before AI output reaches users."],
    ],
  },
  {
    name: "settings",
    boundedContext: "Enterprise configuration",
    capabilities: [
      ["Organization settings", "Manage brand, contact, and booking policy records."],
      ["Feature flags", "Prepare progressive rollout controls."],
      ["Secret references", "Store references to managed secrets rather than raw secret values."],
    ],
  },
  {
    name: "reports",
    boundedContext: "Reports and exports",
    capabilities: [
      ["Report catalog", "Prepare report definitions for admin and agent users."],
      ["Export queue", "Model asynchronous report generation jobs."],
      ["RBAC scope", "Apply role-specific visibility to report outputs."],
    ],
  },
  {
    name: "audit",
    boundedContext: "Audit and activity logging",
    capabilities: [
      ["Audit trail", "Capture actor, action, entity, and metadata records."],
      ["Activity stream", "Prepare user-facing activity history."],
      ["Compliance queries", "Expose filters for operational investigations."],
    ],
  },
];

function pascalCase(value) {
  return value
    .split("-")
    .flatMap((part) => part.split("_"))
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
}

function titleCase(value) {
  return value
    .split("-")
    .flatMap((part) => part.split("_"))
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

const root = join(process.cwd(), "apps/api/src/modules");

for (const moduleDefinition of modules) {
  const { name, boundedContext, capabilities } = moduleDefinition;
  const className = pascalCase(name);
  const title = titleCase(name);
  const moduleRoot = join(root, name);

  for (const directory of [
    "controllers",
    "services",
    "repositories",
    "dto",
    "entities",
    "validators",
    "interfaces",
    "tests",
  ]) {
    mkdirSync(join(moduleRoot, directory), { recursive: true });
  }

  const capabilitiesLiteral = capabilities
    .map(
      ([capabilityName, description]) => `    {
      name: "${capabilityName}",
      description: "${description}"
    }`,
    )
    .join(",\n");

  writeFileSync(
    join(moduleRoot, `${name}.module.ts`),
    `import { Module } from "@nestjs/common";

import { ${className}Controller } from "./controllers/${name}.controller";
import { ${className}Repository } from "./repositories/${name}.repository";
import { ${className}Service } from "./services/${name}.service";
import { ${className}ModuleValidator } from "./validators/${name}.validator";

@Module({
  controllers: [${className}Controller],
  providers: [${className}Service, ${className}Repository, ${className}ModuleValidator],
  exports: [${className}Service]
})
export class ${className}Module {}
`,
  );

  writeFileSync(
    join(moduleRoot, `controllers/${name}.controller.ts`),
    `import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { Public } from "../../../shared/security/decorators/public.decorator";
import { Roles } from "../../../shared/security/decorators/roles.decorator";
import { ${className}SummaryDto } from "../dto/${name}-summary.dto";
import { ${className}Service } from "../services/${name}.service";

@ApiTags("${title}")
@ApiBearerAuth()
@Controller("${name}")
export class ${className}Controller {
  constructor(private readonly service: ${className}Service) {}

  @Public()
  @Get("health")
  getHealth(): Promise<${className}SummaryDto> {
    return this.service.getSummary();
  }

  @Roles("ADMIN")
  @Get("capabilities")
  getCapabilities(): Promise<${className}SummaryDto> {
    return this.service.getSummary();
  }
}
`,
  );

  writeFileSync(
    join(moduleRoot, `dto/${name}-summary.dto.ts`),
    `import type { ModuleCapability, ModuleSummary } from "../../../shared/domain/module-summary";

export class ${className}SummaryDto implements ModuleSummary {
  readonly module: string;
  readonly boundedContext: string;
  readonly status: "READY_FOR_INTEGRATION";
  readonly capabilities: ModuleCapability[];

  constructor(summary: ModuleSummary) {
    this.module = summary.module;
    this.boundedContext = summary.boundedContext;
    this.status = summary.status;
    this.capabilities = summary.capabilities;
  }
}
`,
  );

  writeFileSync(
    join(moduleRoot, `entities/${name}.entity.ts`),
    `import type { ModuleSummary } from "../../../shared/domain/module-summary";

export class ${className}ContextEntity {
  constructor(
    readonly name: string,
    readonly boundedContext: string,
    readonly capabilityCount: number
  ) {}

  static fromSummary(summary: ModuleSummary): ${className}ContextEntity {
    return new ${className}ContextEntity(
      summary.module,
      summary.boundedContext,
      summary.capabilities.length
    );
  }
}
`,
  );

  writeFileSync(
    join(moduleRoot, `interfaces/${name}.interface.ts`),
    `import type { ModuleSummary } from "../../../shared/domain/module-summary";

export interface ${className}ModulePort {
  getSummary(): Promise<ModuleSummary>;
}
`,
  );

  writeFileSync(
    join(moduleRoot, `repositories/${name}.repository.ts`),
    `import { Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

const summary = {
  module: "${name}",
  boundedContext: "${boundedContext}",
  status: "READY_FOR_INTEGRATION",
  capabilities: [
${capabilitiesLiteral}
  ]
} satisfies ModuleSummary;

@Injectable()
export class ${className}Repository {
  findSummary(): ModuleSummary {
    return summary;
  }
}
`,
  );

  writeFileSync(
    join(moduleRoot, `services/${name}.service.ts`),
    `import { Injectable } from "@nestjs/common";

import { ${className}SummaryDto } from "../dto/${name}-summary.dto";
import type { ${className}ModulePort } from "../interfaces/${name}.interface";
import { ${className}Repository } from "../repositories/${name}.repository";
import { ${className}ModuleValidator } from "../validators/${name}.validator";

@Injectable()
export class ${className}Service implements ${className}ModulePort {
  constructor(
    private readonly repository: ${className}Repository,
    private readonly validator: ${className}ModuleValidator
  ) {}

  async getSummary(): Promise<${className}SummaryDto> {
    const summary = this.repository.findSummary();
    this.validator.ensureReady(summary);

    return new ${className}SummaryDto(summary);
  }
}
`,
  );

  writeFileSync(
    join(moduleRoot, `validators/${name}.validator.ts`),
    `import { Injectable } from "@nestjs/common";

import type { ModuleSummary } from "../../../shared/domain/module-summary";

@Injectable()
export class ${className}ModuleValidator {
  ensureReady(summary: ModuleSummary): void {
    if (summary.status !== "READY_FOR_INTEGRATION") {
      throw new Error("${title} module is not ready for integration");
    }

    if (summary.capabilities.length === 0) {
      throw new Error("${title} module must expose at least one capability");
    }
  }
}
`,
  );

  writeFileSync(
    join(moduleRoot, `tests/${name}.service.spec.ts`),
    `import { ${className}Repository } from "../repositories/${name}.repository";
import { ${className}Service } from "../services/${name}.service";
import { ${className}ModuleValidator } from "../validators/${name}.validator";

describe("${className}Service", () => {
  it("returns module readiness and capabilities", async () => {
    const service = new ${className}Service(new ${className}Repository(), new ${className}ModuleValidator());
    const summary = await service.getSummary();

    expect(summary.module).toBe("${name}");
    expect(summary.status).toBe("READY_FOR_INTEGRATION");
    expect(summary.capabilities.length).toBeGreaterThan(0);
  });
});
`,
  );

  writeFileSync(
    join(moduleRoot, "index.ts"),
    `export { ${className}Module } from "./${name}.module";
`,
  );
}
