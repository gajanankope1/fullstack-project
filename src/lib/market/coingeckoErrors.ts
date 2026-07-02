export class CoinGeckoApiError extends Error {
  readonly statusCode: number | undefined;
  readonly retryable: boolean;

  constructor(message: string, statusCode?: number, retryable = true) {
    super(message);
    this.name = "CoinGeckoApiError";
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}
