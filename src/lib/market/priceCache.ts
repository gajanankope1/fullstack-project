interface CacheEntry {
  value: Record<string, string>;
  expiresAt: number;
}

export class PriceCache {
  private readonly cache = new Map<string, CacheEntry>();

  constructor(private readonly ttlMs: number) {}

  get(coinIds: string[]): Record<string, string> | null {
    const key = this.buildKey(coinIds);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() >= entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(coinIds: string[], value: Record<string, string>): void {
    const key = this.buildKey(coinIds);
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  private buildKey(coinIds: string[]): string {
    return [...coinIds].sort().join(",");
  }
}

declare global {
  // eslint-disable-next-line no-var
  var coingeckoPriceCache: PriceCache | undefined;
}

export function getPriceCache(ttlMs: number): PriceCache {
  if (!global.coingeckoPriceCache) {
    global.coingeckoPriceCache = new PriceCache(ttlMs);
  }

  return global.coingeckoPriceCache;
}
