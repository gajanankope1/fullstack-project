# CoinGecko Market Data Rules

Provider:

- CoinGecko Demo API (free tier)
- API key via `COINGECKO_API_KEY` environment variable
- Base URL via `COINGECKO_API_BASE_URL` (default: `https://api.coingecko.com/api/v3`)

Client:

- Use `CoinGeckoClient` in `src/lib/market/coingeckoClient.ts` for HTTP requests
- Authenticate with header `x-cg-demo-api-key`
- Never expose the API key to the frontend

Caching:

- Use in-memory cache via `PriceCache` with TTL from `COINGECKO_PRICE_CACHE_TTL_MS`
- Default TTL: 60 seconds
- Deduplicate in-flight requests for the same coin set

Retry:

- Retry transient failures up to 3 times with exponential backoff
- Retry on HTTP 408, 429, and 5xx responses

Validation:

- Validate CoinGecko responses with Zod before use
- Treat market data as read-only

Fallback:

- Use `MarketDataService` as the single entry point for price data
- Fall back to `MockMarketDataService` when CoinGecko is unavailable
- Application must remain functional during temporary API failures

Usage:

- `getCurrentPrices()` — cached live prices for dashboard and active challenges
- `getLockedPrices()` — fresh snapshot for challenge start/end price locking
