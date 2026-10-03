import { Injectable, Optional } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { srdvCityCodeLookup } from "@vnbus/supplier-sdk";
import type {
  PaymentProviderCode,
  PaymentProviderConfig,
  SupplierCode,
  SupplierIntegrationConfig,
  SupplierTimeoutPolicy,
} from "@vnbus/types";

const SUPPLIER_NAMES: Record<SupplierCode, string> = {
  BCI: "BCI",
  REDBUS: "RedBus",
  ABHIBUS: "AbhiBus",
  TBO: "TBO",
  SRDV: "SRDV Technologies",
  CUSTOM: "Custom Bus API",
};

export interface SrdvConnectionSettings {
  credentials: {
    baseUrl: string;
    apiToken: string;
    clientId: string;
    userName: string;
    password: string;
    endUserIp: string;
  };
  restPathPrefix: string;
  cityCodes: ReadonlyMap<string, string>;
}

const PAYMENT_NAMES: Record<PaymentProviderCode, string> = {
  RAZORPAY: "Razorpay",
  CASHFREE: "Cashfree",
  PHONEPE: "PhonePe",
  STRIPE: "Stripe",
  CUSTOM: "Custom Payment API",
};

@Injectable()
export class IntegrationConfigurationService {
  constructor(@Optional() private readonly config?: ConfigService) {}

  getSupplierConfigs(): SupplierIntegrationConfig[] {
    const priority = this.read("SUPPLIER_PRIORITY", "SRDV,BCI,ABHIBUS,REDBUS,TBO,CUSTOM")
      .split(",")
      .map((code) => code.trim().toUpperCase())
      .filter(Boolean) as SupplierCode[];
    const orderedCodes = uniqueSupplierCodes([
      ...priority,
      "BCI",
      "ABHIBUS",
      "REDBUS",
      "TBO",
      // Listed in the fallback too, so SRDV still appears (disabled, until it
      // has credentials) for a deployment carrying an older SUPPLIER_PRIORITY.
      "SRDV",
      "CUSTOM",
    ]);

    return orderedCodes
      .map((code, index) => this.createSupplierConfig(code, index + 1))
      .sort((left, right) => left.priority - right.priority);
  }

  /**
   * No payment gateway is wired yet: every provider below is a placeholder that
   * refuses to take money. One counts as enabled only when PAYMENT_PROVIDER
   * names it, so nothing reports a working checkout that does not exist.
   */
  getPaymentProviderConfigs(): PaymentProviderConfig[] {
    const selected = this.getActivePaymentProviderCode();
    const providers: PaymentProviderCode[] = [
      "RAZORPAY",
      "CASHFREE",
      "PHONEPE",
      "STRIPE",
      "CUSTOM",
    ];

    return providers.map((code) => ({
      code,
      name: PAYMENT_NAMES[code],
      enabled: code === selected,
      environment: "SANDBOX_PLACEHOLDER",
      currency: code === "STRIPE" ? "USD" : "INR",
      credentialReference: `secret://${code.toLowerCase()}/payment-api-key`,
      configuration: {
        apiUrl: this.read(`${paymentEnvPrefix(code)}_API_URL`, ""),
        webhookSecretRef: `secret://${code.toLowerCase()}/webhook-secret`,
      },
    }));
  }

  /**
   * SRDV connection settings, or null when the supplier is not configured —
   * which is the normal state in development and keeps it unregistered rather
   * than registered-and-failing.
   *
   * Only the base URL and token are required. The legacy body fields are
   * passed through as empty strings when unset: the v9 flow authenticates on
   * the token, and no endpoint we have implemented sends them.
   *
   * Never log the returned object; it carries the token.
   */
  getSrdvConnection(): SrdvConnectionSettings | null {
    const baseUrl = this.read("SRDV_API_URL", "").trim();
    const apiToken = this.read("SRDV_API_TOKEN", "").trim();

    if (!baseUrl || !apiToken) {
      return null;
    }

    return {
      credentials: {
        baseUrl,
        apiToken,
        clientId: this.read("SRDV_CLIENT_ID", "").trim(),
        userName: this.read("SRDV_USER_NAME", "").trim(),
        password: this.read("SRDV_PASSWORD", "").trim(),
        endUserIp: this.read("SRDV_END_USER_IP", "").trim(),
      },
      restPathPrefix: this.read("SRDV_REST_PATH_PREFIX", "v9/rest").trim(),
      cityCodes: this.getSrdvCityCodes(),
    };
  }

  /**
   * City name -> SRDV city code.
   *
   * The base list is SRDV's own 27,201-city export, shipped with the SDK.
   * SRDV_CITY_CODES then overlays it as "bangalore:4,hyderabad:9" so a bad or
   * missing mapping can be corrected without a redeploy.
   *
   * Codes must come from SRDV. A code seen beside a city in an example response
   * does not establish that it means that city — SRDV's own Search sample pairs
   * 19402/8875 with a Bangalore-Hyderabad route, while its city list says those
   * codes are Parigi and Marnal.
   */
  getSrdvCityCodes(): ReadonlyMap<string, string> {
    const mapping = new Map<string, string>(srdvCityCodeLookup());
    const raw = this.read("SRDV_CITY_CODES", "").trim();

    if (!raw) {
      return mapping;
    }

    for (const entry of raw.split(",")) {
      const separatorAt = entry.lastIndexOf(":");

      if (separatorAt <= 0) {
        continue;
      }

      const city = entry.slice(0, separatorAt).trim().toLowerCase();
      const code = entry.slice(separatorAt + 1).trim();

      if (city && code) {
        mapping.set(city, code);
      }
    }

    return mapping;
  }

  /** The provider PAYMENT_PROVIDER names, or null when none is configured. */
  getActivePaymentProviderCode(): PaymentProviderCode | null {
    const configured = this.read("PAYMENT_PROVIDER", "").trim().toUpperCase();

    return configured in PAYMENT_NAMES ? (configured as PaymentProviderCode) : null;
  }

  /** A supplier is enabled exactly when its URL and credential are both set. */
  private createSupplierConfig(code: SupplierCode, priority: number): SupplierIntegrationConfig {
    const apiUrl = this.read(`${supplierEnvPrefix(code)}_API_URL`, "");
    const enabled =
      Boolean(apiUrl.trim()) && Boolean(this.read(supplierCredentialEnv(code), "").trim());

    return {
      code,
      name: SUPPLIER_NAMES[code],
      enabled,
      priority,
      environment: "SANDBOX_PLACEHOLDER",
      baseUrl: apiUrl.trim() || null,
      credentialReference: `secret://${code.toLowerCase()}/api-key`,
      healthStatus: enabled ? "UNKNOWN" : "UNKNOWN",
      timeout: this.getSupplierTimeoutPolicy(code),
    };
  }

  /**
   * Timeout policy for a supplier. Everything is global except the request
   * budget, which a supplier may override: SRDV fans out to many operators per
   * search and cannot answer inside the 3s default, while raising that default
   * would slow every other supplier's failure detection.
   */
  getSupplierTimeoutPolicy(code?: SupplierCode): SupplierTimeoutPolicy {
    const globalRequestTimeoutMs = this.readNumber("SUPPLIER_REQUEST_TIMEOUT_MS", 3000);

    return {
      connectionTimeoutMs: this.readNumber("SUPPLIER_CONNECTION_TIMEOUT_MS", 1500),
      requestTimeoutMs:
        code === "SRDV"
          ? this.readNumber("SRDV_REQUEST_TIMEOUT_MS", 20_000)
          : globalRequestTimeoutMs,
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

/**
 * Which environment variable holds a supplier's secret. SRDV authenticates on
 * an API token rather than the `_API_KEY` the others use, and that same value
 * decides whether the supplier counts as configured.
 */
function supplierCredentialEnv(code: SupplierCode): string {
  return code === "SRDV" ? "SRDV_API_TOKEN" : `${supplierEnvPrefix(code)}_API_KEY`;
}

function supplierEnvPrefix(code: SupplierCode): string {
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
