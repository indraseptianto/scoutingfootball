"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function createRecruitmentBrief(formData: FormData) {
  const supabase = getSupabaseServiceClient();
  const clubSportmonksId = Number(formData.get("clubSportmonksId") ?? 0);
  const targetPosition = String(formData.get("targetPosition") ?? "").trim();
  const roleArchetype = String(formData.get("roleArchetype") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim() || `${targetPosition || "Target"} brief`;
  if (!targetPosition || !roleArchetype) return;

  const payload = {
    name,
    status: String(formData.get("status") ?? "active"),
    club_sportmonks_id: clubSportmonksId || null,
    target_position: targetPosition,
    role_archetype: roleArchetype,
    tactical_style: String(formData.get("tacticalStyle") ?? "Press"),
    min_age: Number(formData.get("minAge") ?? 18) || 18,
    max_age: Number(formData.get("maxAge") ?? 26) || 26,
    contract_preference: String(formData.get("contractPreference") ?? "Any"),
    risk_tolerance: String(formData.get("riskTolerance") ?? "Medium"),
    budget_band: String(formData.get("budgetBand") ?? "Value"),
    league_focus: String(formData.get("leagueFocus") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    updated_at: new Date().toISOString()
  };

  await supabase.from("recruitment_briefs").insert(payload);
  revalidatePath("/briefs");
  revalidatePath("/recommendations");
}

export async function updateRecruitmentBriefStatus(formData: FormData) {
  const supabase = getSupabaseServiceClient();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "draft");
  if (!id) return;

  await supabase
    .from("recruitment_briefs")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/briefs");
}
