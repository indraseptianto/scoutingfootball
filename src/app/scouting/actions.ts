"use server";

import { revalidatePath } from "next/cache";
import { generateScoutingReport } from "@/lib/ai/scouting";
import { buildScoutingSummary, getRecruitmentDataset } from "@/lib/recruitment-data";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function generateAndCacheScoutingReport(formData: FormData) {
  const sportmonksId = Number(formData.get("sportmonksId"));
  const scoutNotes = String(formData.get("scoutNotes") ?? "").trim();
  if (!sportmonksId) return;

  const supabase = getSupabaseServiceClient();
  const { players } = await getRecruitmentDataset(500);
  const player = players.find((item) => item.sportmonks_id === sportmonksId);
  if (!player) return;

  let report: unknown;
  try {
    if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
    const result = await generateScoutingReport({
      player,
      scoutNotes,
      clubContext: `${player.club_name ?? "Unassigned"} recruitment profile from Sportmonks cached season data.`
    });
    report = result.object;
  } catch (error) {
    const summary = buildScoutingSummary(player);
    report = {
      executiveSummary: `${player.display_name} is graded as ${summary.recommendation} from cached Sportmonks data. ${summary.nextAction}`,
      strengths: summary.strengths,
      weaknesses: summary.risks,
      tacticalFit: summary.tacticalFit,
      riskLevel: player.minutes < 450 ? "medium" : "low",
      recommendationScore: summary.score,
      bestRole: player.position_name ?? "Role to validate",
      similarProfiles: [],
      finalRecommendation: summary.recommendation === "Priority Target" ? "Sign" : summary.recommendation === "Scout Further" ? "Monitor" : "Monitor",
      generatedBy: "data-fallback",
      generationNote: error instanceof Error ? error.message : "AI generation unavailable"
    };
  }

  await supabase.from("ai_scouting_reports").insert({
    player_id: player.id,
    status: "completed",
    report
  });

  revalidatePath("/scouting");
}
