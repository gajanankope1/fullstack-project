export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
}

export const PREDEFINED_COINS: CryptoCoin[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
];

export const COIN_IDS = PREDEFINED_COINS.map((coin) => coin.id);

export function getCoinById(coinId: string): CryptoCoin | undefined {
  return PREDEFINED_COINS.find((coin) => coin.id === coinId);
}
