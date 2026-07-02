import { COIN_IDS } from "@/lib/constants/cryptoCoins";
import { COINGECKO_PRICE_CACHE_TTL_MS } from "@/lib/constants/market";
import { CoinGeckoClient } from "@/lib/market/coingeckoClient";
import { MockMarketDataService } from "@/lib/market/mockMarketDataService";
import { getPriceCache } from "@/lib/market/priceCache";

export interface MarketDataProviderStatus {
  provider: "coingecko" | "mock";
  configured: boolean;
  usingFallback: boolean;
}

export interface IMarketDataService {
  getCurrentPrices(coinIds: string[]): Promise<Record<string, string>>;
  getLockedPrices(coinIds: string[]): Promise<Record<string, string>>;
  getAvailableCoinIds(): string[];
  getProviderStatus(): MarketDataProviderStatus;
}

export class MarketDataService implements IMarketDataService {
  private readonly coingeckoClient = new CoinGeckoClient();
  private readonly mockService = new MockMarketDataService();
  private readonly priceCache = getPriceCache(COINGECKO_PRICE_CACHE_TTL_MS);
  private lastUsedFallback = false;

  async getCurrentPrices(coinIds: string[]): Promise<Record<string, string>> {
    if (coinIds.length === 0) {
      return {};
    }

    const cachedPrices = this.priceCache.get(coinIds);

    if (cachedPrices) {
      this.lastUsedFallback = false;
      return cachedPrices;
    }

    try {
      const prices = await this.coingeckoClient.fetchPrices(coinIds);
      this.priceCache.set(coinIds, prices);
      this.lastUsedFallback = false;
      return prices;
    } catch (error) {
      console.error("CoinGecko current price fetch failed:", error);
      this.lastUsedFallback = true;
      return this.mockService.getCurrentPrices(coinIds);
    }
  }

  async getLockedPrices(coinIds: string[]): Promise<Record<string, string>> {
    if (coinIds.length === 0) {
      return {};
    }

    try {
      const prices = await this.coingeckoClient.fetchPrices(coinIds, {
        useCache: false,
      });
      this.priceCache.set(coinIds, prices);
      this.lastUsedFallback = false;
      return prices;
    } catch (error) {
      console.error("CoinGecko locked price fetch failed:", error);
      this.lastUsedFallback = true;
      return this.mockService.getLockedPrices(coinIds);
    }
  }

  getAvailableCoinIds(): string[] {
    return COIN_IDS;
  }

  getProviderStatus(): MarketDataProviderStatus {
    return {
      provider: this.coingeckoClient.isConfigured() ? "coingecko" : "mock",
      configured: this.coingeckoClient.isConfigured(),
      usingFallback: this.lastUsedFallback,
    };
  }
}

declare global {
  // eslint-disable-next-line no-var
  var marketDataService: MarketDataService | undefined;
}

export function getMarketDataService(): MarketDataService {
  if (!global.marketDataService) {
    global.marketDataService = new MarketDataService();
  }

  return global.marketDataService;
}
