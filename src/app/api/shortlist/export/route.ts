import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getSupabaseServiceClient();
  const { data: shortlist } = await supabase
    .from("shortlists")
    .select("id")
    .eq("name", "ScoutFlow Main Shortlist")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!shortlist?.id) {
    return csvResponse("player,position,stage,hidden_gem_score,latest_note\n");
  }

  const { data: rows } = await supabase
    .from("shortlist_players")
    .select("id,stage,player_id")
    .eq("shortlist_id", shortlist.id)
    .order("created_at", { ascending: false });

  const playerIds = (rows ?? []).map((row) => String(row.player_id));
  const [playersResult, notesResult] = await Promise.all([
    playerIds.length > 0
      ? supabase.from("players").select("id,display_name,position_name,hidden_gem_score").in("id", playerIds)
      : Promise.resolve({ data: [] }),
    (rows ?? []).length > 0
      ? supabase
          .from("shortlist_notes")
          .select("shortlist_player_id,note,created_at")
          .in("shortlist_player_id", (rows ?? []).map((row) => String(row.id)))
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] })
  ]);

  const playerById = new Map((playersResult.data ?? []).map((player) => [String(player.id), player]));
  const latestNoteById = new Map<string, string>();
  for (const note of (notesResult.data ?? []) as Array<{ shortlist_player_id: string; note: string }>) {
    const key = String(note.shortlist_player_id);
    if (!latestNoteById.has(key)) latestNoteById.set(key, note.note);
  }

  const csv = [
    ["player", "position", "stage", "hidden_gem_score", "latest_note"],
    ...(rows ?? []).map((row) => {
      const player = playerById.get(String(row.player_id));
      return [
        player?.display_name ?? "Unknown",
        player?.position_name ?? "",
        row.stage,
        String(player?.hidden_gem_score ?? 0),
        latestNoteById.get(String(row.id)) ?? ""
      ];
    })
  ].map((row) => row.map(csvCell).join(",")).join("\n");

  return csvResponse(`${csv}\n`);
}

function csvResponse(body: string) {
  return new NextResponse(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=scoutflow-shortlist.csv"
    }
  });
}

function csvCell(value: string) {
  return `"${value.replaceAll("\"", "\"\"")}"`;
}
