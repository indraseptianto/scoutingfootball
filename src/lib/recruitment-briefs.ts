import { getSupabaseServiceClient } from "@/lib/supabase/server";

export const briefTacticalStyles = ["Press", "Possession", "Counter", "Direct"] as const;
export const briefRiskOptions = ["Low", "Medium", "High"] as const;
export const briefContractOptions = ["Any", "Expiring", "Free Agent"] as const;
export const briefBudgetBands = ["Value", "Balanced", "Premium"] as const;
export const briefStatuses = ["draft", "active", "paused", "closed"] as const;
export const briefRoleArchetypes = [
  "Ball-Winning Midfielder",
  "Progression Fullback",
  "Pressing Winger",
  "Penalty-Box Striker",
  "Build-Up Center Back",
  "Creative Midfielder",
  "Box Crasher",
  "Transition Fullback"
] as const;

export type RecruitmentBrief = {
  id: string;
  name: string;
  status: string;
  club_id: string | null;
  club_sportmonks_id: number | null;
  club_name: string | null;
  target_position: string;
  role_archetype: string;
  tactical_style: string;
  min_age: number;
  max_age: number;
  contract_preference: string;
  risk_tolerance: string;
  budget_band: string;
  league_focus: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listRecruitmentBriefs() {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("recruitment_briefs")
    .select("id,name,status,club_id,club_sportmonks_id,target_position,role_archetype,tactical_style,min_age,max_age,contract_preference,risk_tolerance,budget_band,league_focus,notes,created_at,updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  const clubIds = Array.from(new Set((data ?? []).map((row) => Number(row.club_sportmonks_id)).filter(Boolean)));
  const { data: clubs } = clubIds.length > 0
    ? await supabase.from("clubs").select("sportmonks_id,name").in("sportmonks_id", clubIds)
    : { data: [] };
  const clubMap = new Map((clubs ?? []).map((club) => [Number(club.sportmonks_id), String(club.name)]));

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => normalizeBrief(row, clubMap));
}

export async function getRecruitmentBrief(briefId: string) {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("recruitment_briefs")
    .select("id,name,status,club_id,club_sportmonks_id,target_position,role_archetype,tactical_style,min_age,max_age,contract_preference,risk_tolerance,budget_band,league_focus,notes,created_at,updated_at")
    .eq("id", briefId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const clubId = Number(data.club_sportmonks_id ?? 0);
  const { data: club } = clubId
    ? await supabase.from("clubs").select("sportmonks_id,name").eq("sportmonks_id", clubId).maybeSingle()
    : { data: null };

  return normalizeBrief(data as Record<string, unknown>, new Map(club ? [[Number(club.sportmonks_id), String(club.name)]] : []));
}

export async function listClubOptions() {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.from("clubs").select("id,sportmonks_id,name").order("name").limit(150);
  if (error) throw error;
  return (data ?? []).map((club) => ({
    id: String(club.id),
    sportmonks_id: Number(club.sportmonks_id),
    name: String(club.name)
  }));
}

function normalizeBrief(row: Record<string, unknown>, clubMap: Map<number, string>): RecruitmentBrief {
  const clubSportmonksId = nullableNumber(row.club_sportmonks_id);
  return {
    id: String(row.id),
    name: String(row.name ?? "Untitled brief"),
    status: String(row.status ?? "draft"),
    club_id: typeof row.club_id === "string" ? row.club_id : null,
    club_sportmonks_id: clubSportmonksId,
    club_name: clubSportmonksId ? clubMap.get(clubSportmonksId) ?? null : null,
    target_position: String(row.target_position ?? "Unknown"),
    role_archetype: String(row.role_archetype ?? "Unknown"),
    tactical_style: String(row.tactical_style ?? "Press"),
    min_age: Number(row.min_age ?? 18),
    max_age: Number(row.max_age ?? 26),
    contract_preference: String(row.contract_preference ?? "Any"),
    risk_tolerance: String(row.risk_tolerance ?? "Medium"),
    budget_band: String(row.budget_band ?? "Value"),
    league_focus: typeof row.league_focus === "string" ? row.league_focus : null,
    notes: typeof row.notes === "string" ? row.notes : null,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? "")
  };
}

function nullableNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
