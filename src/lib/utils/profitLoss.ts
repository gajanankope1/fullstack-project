export function calculateNetProfitLoss(
  entryAmount: number,
  payout: number,
  isWinner: boolean,
): number {
  if (isWinner) {
    return payout - entryAmount;
  }

  return -entryAmount;
}

export function formatProfitLoss(amount: number): string {
  const prefix = amount > 0 ? "+" : "";
  return `${prefix}${amount.toLocaleString()}`;
}
