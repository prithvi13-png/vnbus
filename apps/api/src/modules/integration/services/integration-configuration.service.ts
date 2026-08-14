import { Injectable, Optional } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  PaymentProviderCode,
  PaymentProviderConfig,
  SupplierCode,
  SupplierIntegrationConfig,
  SupplierTimeoutPolicy,
} from "@vnbus/types";

const SUPPLIER_NAMES: Record<SupplierCode, string> = {
  MOCK: "Mock Supplier",
  BCI: "BCI",
  REDBUS: "RedBus",
  ABHIBUS: "AbhiBus",
  TBO: "TBO",
  CUSTOM: "Custom Bus API",
};

const PAYMENT_NAMES: Record<PaymentProviderCode, string> = {
  MOCK: "Mock Payment",
  RAZORPAY: "Razorpay",
  CASHFREE: "Cashfree",
  PHONEPE: "PhonePe",
  STRIPE: "Stripe",
  CUSTOM: "Custom Payment API",
};

@Injectable()
export class IntegrationConfigurationService {
  constructor(@Optional() private readonly config?: ConfigService) {}

  getSupplierMode(): "mock" | "production" {
    return this.read("SUPPLIER_MODE", "mock").toLowerCase() === "production"
      ? "production"
      : "mock";
  }

  getSupplierConfigs(): SupplierIntegrationConfig[] {
    const mode = this.getSupplierMode();
    const priority = this.read("SUPPLIER_PRIORITY", "MOCK,BCI,ABHIBUS,REDBUS,TBO,CUSTOM")
      .split(",")
      .map((code) => code.trim().toUpperCase())
      .filter(Boolean) as SupplierCode[];
    const orderedCodes = uniqueSupplierCodes([
      "MOCK",
      ...priority,
      "BCI",
      "ABHIBUS",
      "REDBUS",
      "TBO",
      "CUSTOM",
    ]);

    return orderedCodes
      .map((code, index) => this.createSupplierConfig(code, index + 1, mode))
      .sort((left, right) => left.priority - right.priority);
  }

  getPaymentProviderConfigs(): PaymentProviderConfig[] {
    const selected = this.read("PAYMENT_PROVIDER", "MOCK").toUpperCase() as PaymentProviderCode;
    const providers: PaymentProviderCode[] = [
      "MOCK",
      "RAZORPAY",
      "CASHFREE",
      "PHONEPE",
      "STRIPE",
      "CUSTOM",
    ];

    return providers.map((code) => ({
      code,
      name: PAYMENT_NAMES[code],
      enabled: code === "MOCK" || code === selected,
      environment: code === "MOCK" ? "MOCK" : "SANDBOX_PLACEHOLDER",
      currency: code === "STRIPE" ? "USD" : "INR",
      credentialReference:
        code === "MOCK" ? null : `secret://${code.toLowerCase()}/payment-api-key`,
      configuration: {
        apiUrl: this.read(`${paymentEnvPrefix(code)}_API_URL`, ""),
        webhookSecretRef: code === "MOCK" ? null : `secret://${code.toLowerCase()}/webhook-secret`,
      },
    }));
  }

  getActivePaymentProviderCode(): PaymentProviderCode {
    const configured = this.read("PAYMENT_PROVIDER", "MOCK").toUpperCase() as PaymentProviderCode;

    return configured || "MOCK";
  }

  private createSupplierConfig(
    code: SupplierCode,
    priority: number,
    mode: "mock" | "production",
  ): SupplierIntegrationConfig {
    const apiUrl = this.read(`${supplierEnvPrefix(code)}_API_URL`, "");
    const enabled =
      code === "MOCK"
        ? mode === "mock"
        : mode === "production" &&
          Boolean(apiUrl.trim()) &&
          Boolean(this.read(`${supplierEnvPrefix(code)}_API_KEY`, ""));

    return {
      code,
      name: SUPPLIER_NAMES[code],
      enabled,
      priority,
      environment: code === "MOCK" ? "MOCK" : "SANDBOX_PLACEHOLDER",
      baseUrl: apiUrl.trim() || null,
      credentialReference: code === "MOCK" ? null : `secret://${code.toLowerCase()}/api-key`,
      healthStatus: enabled ? "UNKNOWN" : "UNKNOWN",
      timeout: this.getSupplierTimeoutPolicy(),
    };
  }

  private getSupplierTimeoutPolicy(): SupplierTimeoutPolicy {
    return {
      connectionTimeoutMs: this.readNumber("SUPPLIER_CONNECTION_TIMEOUT_MS", 1500),
      requestTimeoutMs: this.readNumber("SUPPLIER_REQUEST_TIMEOUT_MS", 3000),
      retryCount: this.readNumber("SUPPLIER_RETRY_COUNT", 1),
      retryDelayMs: this.readNumber("SUPPLIER_RETRY_DELAY_MS", 150),
      circuitBreakerThreshold: this.readNumber("SUPPLIER_CIRCUIT_BREAKER_THRESHOLD", 3),
      circuitBreakerCooldownMs: this.readNumber("SUPPLIER_CIRCUIT_BREAKER_COOLDOWN_MS", 30_000),
    };
  }

  private read(key: string, fallback: string): string {
    return this.config?.get<string>(key) ?? process.env[key] ?? fallback;
  }

  private readNumber(key: string, fallback: number): number {
    const value = Number(this.read(key, String(fallback)));

    return Number.isFinite(value) && value >= 0 ? value : fallback;
  }
}

function uniqueSupplierCodes(codes: SupplierCode[]): SupplierCode[] {
  return [...new Set(codes.filter((code): code is SupplierCode => code in SUPPLIER_NAMES))];
}

function supplierEnvPrefix(code: SupplierCode): string {
  if (code === "MOCK") {
    return "MOCK_SUPPLIER";
  }
  if (code === "CUSTOM") {
    return "CUSTOM_BUS";
  }

  return code;
}

function paymentEnvPrefix(code: PaymentProviderCode): string {
  if (code === "CUSTOM") {
    return "CUSTOM_PAYMENT";
  }

  return code;
}
