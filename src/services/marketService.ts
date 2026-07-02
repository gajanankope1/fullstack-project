import { PREDEFINED_COINS } from "@/lib/constants/cryptoCoins";
import { getMarketDataService } from "@/lib/market/marketDataService";

export class MarketService {
  private readonly marketDataService = getMarketDataService();

  async getOverview() {
    const coinIds = PREDEFINED_COINS.map((coin) => coin.id);
    const prices = await this.marketDataService.getCurrentPrices(coinIds);
    const providerStatus = this.marketDataService.getProviderStatus();

    return {
      provider: providerStatus,
      coins: PREDEFINED_COINS.map((coin) => ({
        ...coin,
        currentPrice: prices[coin.id],
      })),
      updatedAt: new Date().toISOString(),
    };
  }
}
