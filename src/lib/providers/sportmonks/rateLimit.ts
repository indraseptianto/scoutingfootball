const DEFAULT_DELAY_MS = 200;

export async function waitForSportmonksSlot(delayMs = DEFAULT_DELAY_MS) {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

export function retryDelayMs(attempt: number, retryAfterHeader?: string | null) {
  if (retryAfterHeader) {
    const retryAfterSeconds = Number(retryAfterHeader);
    if (Number.isFinite(retryAfterSeconds)) return retryAfterSeconds * 1000;
  }

  return Math.min(1000 * 2 ** attempt, 15_000);
}
