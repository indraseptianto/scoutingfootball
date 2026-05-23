export type HiddenGemInput = {
  performanceRatio: number;
  leagueLevelBonus: number;
  ageBonus: number;
  contractOpportunity: number;
  consistency: number;
  marketGap: number;
};

export function calculateHiddenGemScore(input: HiddenGemInput) {
  const score =
    input.performanceRatio * 0.3 +
    input.leagueLevelBonus * 0.15 +
    input.ageBonus * 0.15 +
    input.contractOpportunity * 0.2 +
    input.consistency * 0.1 +
    input.marketGap * 0.1;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function hiddenGemTier(score: number) {
  if (score >= 90) return "Elite";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Emerging";
  return "Monitor";
}
