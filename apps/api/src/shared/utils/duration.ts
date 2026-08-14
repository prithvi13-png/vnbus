type DurationUnit = "s" | "m" | "h" | "d";

const durationMultipliersMs: Record<DurationUnit, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export function durationToMilliseconds(value: string, fallbackMs: number): number {
  const match = /^(\d+)([smhd])$/u.exec(value);

  if (!match) {
    return fallbackMs;
  }

  const [, rawAmount, rawUnit] = match;

  if (!rawAmount || !isDurationUnit(rawUnit)) {
    return fallbackMs;
  }

  const amount = Number(rawAmount);

  if (!Number.isFinite(amount)) {
    return fallbackMs;
  }

  return amount * durationMultipliersMs[rawUnit];
}

export function durationToSeconds(value: string, fallbackSeconds: number): number {
  return Math.floor(durationToMilliseconds(value, fallbackSeconds * 1_000) / 1_000);
}

function isDurationUnit(value: string | undefined): value is DurationUnit {
  return value === "s" || value === "m" || value === "h" || value === "d";
}
