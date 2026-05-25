"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const DEFAULT_SHORTLIST_NAME = "ScoutFlow Main Shortlist";

export async function addPlayerToShortlist(formData: FormData) {
  const sportmonksId = Number(formData.get("sportmonksId"));
  const stage = String(formData.get("stage") ?? "watchlist");
  if (!sportmonksId) return;

  const supabase = getSupabaseServiceClient();
  const shortlist = await getOrCreateDefaultShortlist();
  const { data: player } = await supabase
    .from("players")
    .select("id")
    .eq("sportmonks_id", sportmonksId)
    .maybeSingle();

  if (!player?.id) return;

  await supabase
    .from("shortlist_players")
    .upsert(
      {
        shortlist_id: shortlist.id,
        player_id: player.id,
        stage
      },
      { onConflict: "shortlist_id,player_id" }
    );

  revalidatePath("/shortlist");
}

export async function moveShortlistPlayer(formData: FormData) {
  const shortlistPlayerId = String(formData.get("shortlistPlayerId") ?? "");
  const stage = String(formData.get("stage") ?? "watchlist");
  if (!shortlistPlayerId) return;

  const supabase = getSupabaseServiceClient();
  await supabase.from("shortlist_players").update({ stage }).eq("id", shortlistPlayerId);
  revalidatePath("/shortlist");
}

export async function addShortlistNote(formData: FormData) {
  const shortlistPlayerId = String(formData.get("shortlistPlayerId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!shortlistPlayerId || !note) return;

  const supabase = getSupabaseServiceClient();
  await supabase.from("shortlist_notes").insert({
    shortlist_player_id: shortlistPlayerId,
    note
  });

  revalidatePath("/shortlist");
}

export async function getOrCreateDefaultShortlist() {
  const supabase = getSupabaseServiceClient();
  const { data: existing } = await supabase
    .from("shortlists")
    .select("id,name")
    .eq("name", DEFAULT_SHORTLIST_NAME)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("shortlists")
    .insert({
      name: DEFAULT_SHORTLIST_NAME,
      description: "Persistent workspace shortlist for ScoutFlow MVP."
    })
    .select("id,name")
    .single();

  if (error) throw error;
  return data;
}
