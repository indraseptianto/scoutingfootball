import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { scoutingReportPrompt } from "./prompts";

export const scoutingReportSchema = z.object({
  executiveSummary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  tacticalFit: z.string(),
  riskLevel: z.enum(["low", "medium", "high"]),
  recommendationScore: z.number().min(0).max(100),
  bestRole: z.string(),
  similarProfiles: z.array(z.string()),
  finalRecommendation: z.enum(["Sign", "Monitor", "Avoid"])
});

export async function generateScoutingReport(input: {
  player: unknown;
  clubContext?: string;
  scoutNotes?: string;
}) {
  return generateObject({
    model: openai("gpt-4o"),
    schema: scoutingReportSchema,
    system: scoutingReportPrompt,
    prompt: JSON.stringify(input)
  });
}
