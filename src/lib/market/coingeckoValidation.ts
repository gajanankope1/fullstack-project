import { z } from "zod";

const coinPriceSchema = z.object({
  usd: z.number(),
});

const simplePriceResponseSchema = z.record(z.string(), coinPriceSchema);

export function parseSimplePriceResponse(
  payload: unknown,
  requestedCoinIds: string[],
): Record<string, string> {
  const parsed = simplePriceResponseSchema.parse(payload);
  const prices: Record<string, string> = {};

  for (const coinId of requestedCoinIds) {
    const coinPrice = parsed[coinId];

    if (!coinPrice) {
      throw new Error(`Missing price data for ${coinId}`);
    }

    prices[coinId] = coinPrice.usd.toString();
  }

  return prices;
}

export async function pingResponseSchema(payload: unknown): Promise<boolean> {
  const schema = z.object({
    gecko_says: z.string().optional(),
  });

  schema.parse(payload);
  return true;
}
