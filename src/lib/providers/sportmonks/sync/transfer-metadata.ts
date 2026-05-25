import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { normalizePlayer } from "../normalize/players";
import { normalizeTransfer } from "../normalize/transfers";

type JsonRecord = Record<string, unknown>;

export async function upsertTransferMetadataFromPlayers(players: JsonRecord[]) {
  const transfers = players.flatMap((player) => [
    ...extractTransfers(player, "transfers"),
    ...extractTransfers(player, "pendingTransfers")
  ]);

  if (transfers.length === 0) return 0;
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("transfers").upsert(transfers, { onConflict: "sportmonks_id" });
  if (error) throw error;
  return transfers.length;
}

export async function upsertPlayersFromTransfers(transfers: JsonRecord[]) {
  const players = transfers
    .map((transfer) => transfer.player)
    .filter((player): player is JsonRecord => isRecord(player))
    .map(normalizePlayer)
    .filter((player) => player.sportmonks_id);

  if (players.length === 0) return 0;
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("players").upsert(players, { onConflict: "sportmonks_id" });
  if (error) throw error;
  return players.length;
}

function extractTransfers(player: JsonRecord, key: "transfers" | "pendingTransfers") {
  const value = player[key];
  if (!Array.isArray(value)) return [];
  const source = key === "pendingTransfers" ? "player_pending" : "player_history";
  return value
    .filter((transfer): transfer is JsonRecord => isRecord(transfer))
    .map((transfer) => normalizeTransfer({ ...transfer, player_id: transfer.player_id ?? player.id }, source))
    .filter((transfer) => transfer.sportmonks_id);
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
