import {
  COINGECKO_DEFAULT_BASE_URL,
  COINGECKO_MAX_RETRIES,
  COINGECKO_RETRY_BASE_DELAY_MS,
} from "@/lib/constants/market";
import { CoinGeckoApiError } from "@/lib/market/coingeckoErrors";
import { parseSimplePriceResponse } from "@/lib/market/coingeckoValidation";

interface FetchPricesOptions {
  useCache?: boolean;
}

function getApiKey(): string | undefined {
  return process.env.COINGECKO_API_KEY?.trim() || undefined;
}

function getBaseUrl(): string {
  return process.env.COINGECKO_API_BASE_URL?.trim() || COINGECKO_DEFAULT_BASE_URL;
}

function buildRequestUrl(coinIds: string[]): string {
  const params = new URLSearchParams({
    ids: coinIds.join(","),
    vs_currencies: "usd",
    precision: "full",
  });

  return `${getBaseUrl()}/simple/price?${params.toString()}`;
}

function getRetryDelay(attempt: number): number {
  return COINGECKO_RETRY_BASE_DELAY_MS * 2 ** attempt;
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

declare global {
  // eslint-disable-next-line no-var
  var coingeckoInFlightRequests:
    | Map<string, Promise<Record<string, string>>>
    | undefined;
}

function getInFlightRequests(): Map<string, Promise<Record<string, string>>> {
  if (!global.coingeckoInFlightRequests) {
    global.coingeckoInFlightRequests = new Map();
  }

  return global.coingeckoInFlightRequests;
}

export class CoinGeckoClient {
  isConfigured(): boolean {
    return Boolean(getApiKey());
  }

  async ping(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    const response = await this.request("/ping");
    return response.ok;
  }

  async fetchPrices(
    coinIds: string[],
    options: FetchPricesOptions = {},
  ): Promise<Record<string, string>> {
    if (coinIds.length === 0) {
      return {};
    }

    if (!this.isConfigured()) {
      throw new CoinGeckoApiError(
        "COINGECKO_API_KEY is not configured",
        undefined,
        false,
      );
    }

    const uniqueCoinIds = [...new Set(coinIds)];
    const requestKey = uniqueCoinIds.sort().join(",");

    if (options.useCache !== false) {
      const inFlight = getInFlightRequests().get(requestKey);

      if (inFlight) {
        return inFlight;
      }
    }

    const requestPromise = this.fetchPricesWithRetry(uniqueCoinIds);

    if (options.useCache !== false) {
      getInFlightRequests().set(requestKey, requestPromise);
    }

    try {
      return await requestPromise;
    } finally {
      if (options.useCache !== false) {
        getInFlightRequests().delete(requestKey);
      }
    }
  }

  private async fetchPricesWithRetry(
    coinIds: string[],
  ): Promise<Record<string, string>> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < COINGECKO_MAX_RETRIES; attempt += 1) {
      try {
        const response = await this.request(buildRequestUrl(coinIds));

        if (!response.ok) {
          const retryable = isRetryableStatus(response.status);
          throw new CoinGeckoApiError(
            `CoinGecko request failed with status ${response.status}`,
            response.status,
            retryable,
          );
        }

        const payload = await response.json();
        return parseSimplePriceResponse(payload, coinIds);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        const retryable =
          error instanceof CoinGeckoApiError ? error.retryable : true;
        const isLastAttempt = attempt === COINGECKO_MAX_RETRIES - 1;

        if (!retryable || isLastAttempt) {
          break;
        }

        await sleep(getRetryDelay(attempt));
      }
    }

    throw lastError ?? new CoinGeckoApiError("CoinGecko request failed");
  }

  private async request(pathOrUrl: string): Promise<Response> {
    const apiKey = getApiKey();

    if (!apiKey) {
      throw new CoinGeckoApiError(
        "COINGECKO_API_KEY is not configured",
        undefined,
        false,
      );
    }

    const url = pathOrUrl.startsWith("http")
      ? pathOrUrl
      : `${getBaseUrl()}${pathOrUrl}`;

    return fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-cg-demo-api-key": apiKey,
      },
      cache: "no-store",
    });
  }
}
