import mongoose from "mongoose";

import { connectDB } from "@/lib/db/mongoose";
import { CoinGeckoClient } from "@/lib/market/coingeckoClient";
import { getMarketDataService } from "@/lib/market/marketDataService";

export interface HealthStatus {
  status: "ok" | "degraded";
  database: "connected" | "disconnected";
  market: {
    provider: "coingecko" | "mock";
    configured: boolean;
    reachable: boolean;
    usingFallback: boolean;
  };
  timestamp: string;
}

export class HealthService {
  private readonly coingeckoClient = new CoinGeckoClient();
  private readonly marketDataService = getMarketDataService();

  async check(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    let database: HealthStatus["database"] = "disconnected";

    try {
      await connectDB();
      await mongoose.connection.db?.admin().ping();
      database = "connected";
    } catch {
      database = "disconnected";
    }

    const providerStatus = this.marketDataService.getProviderStatus();
    let reachable = false;

    if (providerStatus.configured) {
      reachable = await this.coingeckoClient.ping();
    }

    const market = {
      provider: providerStatus.provider,
      configured: providerStatus.configured,
      reachable,
      usingFallback: providerStatus.usingFallback,
    };

    const isHealthy =
      database === "connected" &&
      (!market.configured || market.reachable || market.usingFallback);

    return {
      status: isHealthy ? "ok" : "degraded",
      database,
      market,
      timestamp,
    };
  }
}
