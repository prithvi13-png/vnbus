import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { HealthCheckComponent, HealthCheckResponse } from "@vnbus/types";

@Injectable()
export class HealthRepository {
  constructor(private readonly config?: ConfigService) {}

  getHealth(): HealthCheckResponse {
    return response(this.productionDependencyChecks());
  }

  getReady(): HealthCheckResponse {
    const readiness = this.productionDependencyChecks().filter((item) =>
      ["API", "DATABASE", "REDIS", "QUEUE", "SUPPLIER", "PAYMENT"].includes(item.component),
    );

    return response(readiness);
  }

  getLive(): HealthCheckResponse {
    return response([component("API", "HEALTHY", 4, "Process is alive.")]);
  }

  private productionDependencyChecks(): HealthCheckComponent[] {
    const env = this.value("NODE_ENV", process.env.NODE_ENV ?? "development");
    const isProductionLike = env === "production" || env === "staging";
    const supplierMode = this.value("SUPPLIER_MODE", "mock");
    const paymentProvider = this.value("PAYMENT_PROVIDER", "MOCK").toUpperCase();
    const emailProvider = this.value("EMAIL_PROVIDER", "mock");

    return [
      component("API", "HEALTHY", 4, "Nest process is serving the versioned API."),
      requiredComponent(
        "DATABASE",
        hasUsableValue(this.value("DATABASE_URL")),
        isProductionLike,
        "PostgreSQL connection string is configured.",
        "DATABASE_URL is missing or still a placeholder.",
        "Local/test database readiness is configured by the active test harness.",
      ),
      requiredComponent(
        "REDIS",
        hasUsableValue(this.value("REDIS_URL")),
        isProductionLike,
        "Redis connection string is configured for cache, rate limits, locks, and queues.",
        "REDIS_URL is missing or still a placeholder.",
        "Local/test Redis readiness is configured by the active test harness.",
      ),
      requiredComponent(
        "QUEUE",
        hasUsableValue(this.value("REDIS_URL")),
        isProductionLike,
        "BullMQ queues inherit Redis connection and production retry defaults.",
        "Queue readiness is blocked because Redis is not configured.",
        "Local/test BullMQ readiness is configured by the active test harness.",
      ),
      this.configuredOrDegraded(
        "STORAGE",
        ["S3_BUCKET", "S3_REGION"],
        isProductionLike,
        "S3 storage configuration is present.",
        "S3 is not configured; ticket/object storage remains placeholder-backed.",
      ),
      this.configuredOrDegraded(
        "EMAIL",
        emailProvider === "mock" ? [] : ["EMAIL_FROM", "SMTP_HOST"],
        isProductionLike && emailProvider !== "mock",
        emailProvider === "mock"
          ? "Mock email adapter is active; live delivery is disabled."
          : "Email provider configuration is present.",
        "Live email provider settings are incomplete.",
      ),
      supplierMode === "mock"
        ? component(
            "SUPPLIER",
            "HEALTHY",
            7,
            "Mock supplier adapter is active; live suppliers are disabled.",
          )
        : this.configuredOrDegraded(
            "SUPPLIER",
            ["BCI_API_URL", "BCI_API_KEY"],
            isProductionLike,
            "At least one production supplier configuration is present.",
            "Production supplier mode is enabled but supplier credentials are incomplete.",
          ),
      paymentProvider === "MOCK"
        ? component(
            "PAYMENT",
            "HEALTHY",
            6,
            "Mock payment provider is active; live gateway is disabled.",
          )
        : this.configuredOrDegraded(
            "PAYMENT",
            ["PAYMENT_API_KEY", "PAYMENT_WEBHOOK_SECRET"],
            isProductionLike,
            "Payment gateway configuration is present.",
            "Live payment provider is selected but credentials/webhook secret are incomplete.",
          ),
    ];
  }

  private configuredOrDegraded(
    componentName: HealthCheckComponent["component"],
    requiredKeys: string[],
    requireInProduction: boolean,
    okMessage: string,
    degradedMessage: string,
  ): HealthCheckComponent {
    const configured =
      requiredKeys.length === 0 || requiredKeys.every((key) => hasUsableValue(this.value(key)));

    if (configured) {
      return component(componentName, "HEALTHY", 10, okMessage);
    }

    return component(
      componentName,
      requireInProduction ? "DEGRADED" : "DISABLED",
      0,
      degradedMessage,
    );
  }

  private value(key: string, fallback = ""): string {
    return this.config?.get<string>(key) ?? process.env[key] ?? fallback;
  }
}

function response(components: HealthCheckComponent[]): HealthCheckResponse {
  return {
    status: components.some((item) => item.status === "DOWN")
      ? "DOWN"
      : components.some((item) => item.status === "DEGRADED")
        ? "DEGRADED"
        : "HEALTHY",
    checkedAt: new Date().toISOString(),
    components,
  };
}

function requiredComponent(
  componentName: HealthCheckComponent["component"],
  configured: boolean,
  requireInProduction: boolean,
  okMessage: string,
  downMessage: string,
  localMessage: string,
): HealthCheckComponent {
  if (configured) {
    return component(componentName, "HEALTHY", 8, okMessage);
  }

  if (!requireInProduction) {
    return component(componentName, "HEALTHY", 1, localMessage);
  }

  return component(componentName, "DOWN", 0, downMessage);
}

function hasUsableValue(value?: string): boolean {
  const trimmed = value?.trim();

  if (!trimmed) {
    return false;
  }

  return !trimmed.toLowerCase().includes("replace-with");
}

function component(
  componentName: HealthCheckComponent["component"],
  status: HealthCheckComponent["status"],
  latencyMs: number,
  message: string,
): HealthCheckComponent {
  return {
    component: componentName,
    status,
    latencyMs,
    message,
  };
}
