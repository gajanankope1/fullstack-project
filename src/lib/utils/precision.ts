const PRECISION_SCALE = 1e8;

export function toScaledInteger(value: string | number): bigint {
  const numericValue = typeof value === "string" ? Number(value) : value;
  return BigInt(Math.round(numericValue * PRECISION_SCALE));
}

export function calculatePercentageChange(
  startingPrice: string,
  endingPrice: string,
): string {
  const start = toScaledInteger(startingPrice);
  const end = toScaledInteger(endingPrice);

  if (start === BigInt(0)) {
    return "0";
  }

  const change = ((end - start) * BigInt(10000)) / start;
  const whole = change / BigInt(100);
  const fraction = change % BigInt(100);
  const fractionText = fraction < BigInt(0)
    ? `${(-fraction).toString().padStart(2, "0")}`
    : fraction.toString().padStart(2, "0");

  return `${whole}.${fractionText}`;
}

export function comparePercentageChange(left: string, right: string): number {
  const leftValue = toScaledInteger(left);
  const rightValue = toScaledInteger(right);

  if (leftValue === rightValue) {
    return 0;
  }

  return leftValue > rightValue ? 1 : -1;
}
