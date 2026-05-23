import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getClubDetail(Number(id));

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-8">
      <Button variant="ghost" asChild><a href="/clubs"><ArrowLeft size={16} /> Clubs</a></Button>

      {data.error ? (
        <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{data.error}</div>
      ) : data.club ? (
        <>
          <section className="mt-6">
            <p className="text-sm text-accent">Club Profile</p>
            <h1 className="mt-2 text-4xl font-semibold">{data.club.name}</h1>
            <p className="mt-3 text-muted">{data.players.length} synced squad players</p>
          </section>

          <Card className="mt-8">
            <CardHeader><CardTitle>Squad</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="grid min-w-[760px] grid-cols-[1.4fr_1fr_1fr_0.5fr] border-b border-border pb-3 text-sm text-muted">
                  <span>Name</span>
                  <span>Position</span>
                  <span>Nationality</span>
                  <span>Jersey</span>
                </div>
                {data.players.map((player) => (
                  <div key={`${player.sportmonks_id}-${player.jersey_number ?? "n"}`} className="grid min-w-[760px] grid-cols-[1.4fr_1fr_1fr_0.5fr] border-b border-border py-4 text-sm last:border-0">
                    <a className="font-medium hover:text-accent" href={`/players/${player.sportmonks_id}`}>{player.display_name}</a>
                    <span>{player.position_name ?? "Unknown"}</span>
                    <span className="text-muted">{player.nationality_name ?? "Unknown"}</span>
                    <span className="font-mono text-accent">{player.jersey_number ?? "-"}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="mt-6 text-muted">Club not found.</p>
      )}
    </main>
  );
}

async function getClubDetail(sportmonksId: number) {
  try {
    const supabase = getSupabaseServiceClient();
    const { data: club, error } = await supabase
      .from("clubs")
      .select("sportmonks_id,name,short_code,image_path")
      .eq("sportmonks_id", sportmonksId)
      .maybeSingle();

    if (error) throw error;
    if (!club) return { club: null, players: [], error: null };

    const { data: squadRows, error: squadError } = await supabase
      .from("squad_players")
      .select("player_sportmonks_id,jersey_number")
      .eq("team_sportmonks_id", sportmonksId)
      .limit(80);

    if (squadError) throw squadError;

    const playerIds = Array.from(new Set((squadRows ?? []).map((row) => Number(row.player_sportmonks_id)).filter(Boolean)));
    const { data: playerRows } = playerIds.length > 0
      ? await supabase
          .from("players")
          .select("sportmonks_id,display_name,position_name,nationality_name")
          .in("sportmonks_id", playerIds)
      : { data: [] };

    const squadByPlayer = new Map((squadRows ?? []).map((row) => [Number(row.player_sportmonks_id), row.jersey_number as number | null]));
    const players = (playerRows ?? [])
      .map((player) => ({
        ...player,
        jersey_number: squadByPlayer.get(Number(player.sportmonks_id)) ?? null
      }))
      .sort((a, b) => String(a.display_name).localeCompare(String(b.display_name)));

    return { club, players, error: null };
  } catch (error) {
    return {
      club: null,
      players: [],
      error: error instanceof Error ? error.message : "Unable to load club."
    };
  }
}
