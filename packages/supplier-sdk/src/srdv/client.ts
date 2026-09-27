import type { SrdvCredentials, SrdvError } from "./types";

/**
 * Thin HTTP client for SRDV. One POST per operation, credentials in the body
 * and the token in a header, exactly as the integration guide specifies.
 *
 * SRDV reports failures in a 200 response body (`Error.ErrorCode !== 0`) as
 * well as by status code, so both are turned into the same thrown error.
 */
export class SrdvApiError extends Error {
  constructor(
    readonly operation: string,
    readonly errorCode: number,
    message: string,
    readonly httpStatus?: number,
  ) {
    super(message);
    this.name = "SrdvApiError";
  }
}

export interface SrdvClientOptions {
  credentials: SrdvCredentials;
  timeoutMs?: number;
  /** Injected in tests; defaults to global fetch. */
  fetchImpl?: typeof fetch;
}

interface SrdvEnvelope {
  Error?: SrdvError;
}

export class SrdvClient {
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: SrdvClientOptions) {
    this.timeoutMs = options.timeoutMs ?? 20_000;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  /** Credentials every request body repeats. */
  get authBody(): { ClientId: string; UserName: string; Password: string } {
    const { clientId, userName, password } = this.options.credentials;

    return { ClientId: clientId, UserName: userName, Password: password };
  }

  async post<T extends SrdvEnvelope>(
    operation: string,
    path: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    const { baseUrl, apiToken, endUserIp } = this.options.credentials;
    const url = `${baseUrl.replace(/\/+$/u, "")}/${path.replace(/^\/+/u, "")}`;

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Token": apiToken,
          // Sent as a header too: SRDV ties requests to a whitelisted IP and
          // the guide lists EndUserIp among the required credentials.
          EndUserIp: endUserIp,
        },
        body: JSON.stringify({ ...this.authBody, EndUserIp: endUserIp, ...body }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (cause) {
      const reason = cause instanceof Error ? cause.message : "network failure";
      throw new SrdvApiError(operation, -1, `SRDV ${operation} request failed: ${reason}`);
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new SrdvApiError(
        operation,
        -1,
        `SRDV ${operation} returned HTTP ${response.status}: ${detail.slice(0, 300)}`,
        response.status,
      );
    }

    const payload = (await response.json()) as T;

    // A 200 with a non-zero ErrorCode is still a failure.
    if (payload.Error && payload.Error.ErrorCode !== 0) {
      throw new SrdvApiError(
        operation,
        payload.Error.ErrorCode,
        payload.Error.ErrorMessage || `SRDV ${operation} failed`,
        response.status,
      );
    }

    return payload;
  }
}
