import { COIN_IDS } from "@/lib/constants/cryptoCoins";

const BASE_PRICES: Record<string, number> = {
  bitcoin: 65000,
  ethereum: 3200,
  solana: 145,
  cardano: 0.62,
  ripple: 0.58,
  dogecoin: 0.14,
  polkadot: 7.2,
  "avalanche-2": 35,
};

function getBasePrice(coinId: string): number {
  return BASE_PRICES[coinId] ?? 100;
}

function applyLiveVariance(basePrice: number): number {
  const variance = (Math.random() - 0.5) * 0.02;
  return Number((basePrice * (1 + variance)).toFixed(8));
}

export class MockMarketDataService {
  async getCurrentPrices(coinIds: string[]): Promise<Record<string, string>> {
    const prices: Record<string, string> = {};

    for (const coinId of coinIds) {
      prices[coinId] = applyLiveVariance(getBasePrice(coinId)).toString();
    }

    return prices;
  }

  async getLockedPrices(coinIds: string[]): Promise<Record<string, string>> {
    const prices: Record<string, string> = {};

    for (const coinId of coinIds) {
      prices[coinId] = getBasePrice(coinId).toFixed(8);
    }

    return prices;
  }

  getAvailableCoinIds(): string[] {
    return COIN_IDS;
  }
}
