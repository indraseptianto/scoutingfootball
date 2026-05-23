import { Search, SlidersHorizontal, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { hiddenGemTier } from "@/lib/hidden-gem";

type PlayerRow = {
  sportmonks_id: number;
  display_name: string;
  position_name: string | null;
  nationality_name: string | null;
  hidden_gem_score: number;
  club_name: string | null;
};

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const { players, counts, error } = await getPlayerDatabase();

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-accent">Player Database</p>
          <h1 className="mt-2 text-3xl font-semibold">Recruitment search</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Live from your Supabase cache populated by Sportmonks Football API v3.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary"><SlidersHorizontal size={16} /> Filters</Button>
          <Button><Search size={16} /> Search</Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Metric label="Players" value={counts.players} />
        <Metric label="Clubs" value={counts.clubs} />
        <Metric label="Squad Rows" value={counts.squads} />
        <Metric label="Fixtures" value={counts.fixtures} />
      </div>

      <Card className="mt-8 overflow-hidden">
        <CardHeader>
          <CardTitle>Shortlist-ready profiles</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid min-w-[860px] grid-cols-[1.4fr_0.9fr_1fr_1fr_0.7fr_0.8fr] border-b border-border pb-3 text-sm text-muted">
                <span>Name</span>
                <span>Position</span>
                <span>Nationality</span>
                <span>Club</span>
                <span>Gem</span>
                <span>Tier</span>
              </div>
              {players.map((player) => (
                <div
                  key={player.sportmonks_id}
                  className="grid min-w-[860px] grid-cols-[1.4fr_0.9fr_1fr_1fr_0.7fr_0.8fr] border-b border-border py-4 text-sm last:border-0"
                >
                  <span className="font-medium">{player.display_name}</span>
                  <span>{player.position_name ?? "Unknown"}</span>
                  <span className="text-muted">{player.nationality_name ?? "Unknown"}</span>
                  <span className="text-muted">{player.club_name ?? "Unassigned"}</span>
                  <span className="font-mono text-accent">{player.hidden_gem_score}</span>
                  <span className="inline-flex items-center gap-2"><Star size={14} className="text-accent" /> {hiddenGemTier(player.hidden_gem_score)}</span>
                </div>
              ))}
              {players.length === 0 ? <p className="py-8 text-sm text-muted">No players found in Supabase yet.</p> : null}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-3xl font-semibold text-accent">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}

async function getPlayerDatabase() {
  try {
    const supabase = getSupabaseServiceClient();
    const [playersCount, clubsCount, squadsCount, fixturesCount, playerRows] = await Promise.all([
      supabase.from("players").select("id", { count: "exact", head: true }),
      supabase.from("clubs").select("id", { count: "exact", head: true }),
      supabase.from("squad_players").select("id", { count: "exact", head: true }),
      supabase.from("fixtures").select("id", { count: "exact", head: true }),
      supabase
        .from("players")
        .select("sportmonks_id,display_name,position_name,nationality_name,hidden_gem_score")
        .order("display_name", { ascending: true })
        .limit(80)
    ]);

    if (playerRows.error) throw playerRows.error;

    const players = (playerRows.data ?? []) as PlayerRow[];
    const playerIds = players.map((player) => player.sportmonks_id);

    const { data: squadRows } = await supabase
      .from("squad_players")
      .select("player_sportmonks_id,team_sportmonks_id")
      .in("player_sportmonks_id", playerIds);

    const teamIds = Array.from(new Set((squadRows ?? []).map((row) => row.team_sportmonks_id).filter(Boolean)));
    const { data: clubRows } = await supabase
      .from("clubs")
      .select("sportmonks_id,name")
      .in("sportmonks_id", teamIds);

    const teamByPlayer = new Map((squadRows ?? []).map((row) => [Number(row.player_sportmonks_id), Number(row.team_sportmonks_id)]));
    const clubByTeam = new Map((clubRows ?? []).map((row) => [Number(row.sportmonks_id), row.name as string]));

    return {
      players: players.map((player) => ({
        ...player,
        club_name: clubByTeam.get(teamByPlayer.get(player.sportmonks_id) ?? 0) ?? null
      })),
      counts: {
        players: playersCount.count ?? 0,
        clubs: clubsCount.count ?? 0,
        squads: squadsCount.count ?? 0,
        fixtures: fixturesCount.count ?? 0
      },
      error: null
    };
  } catch (error) {
    return {
      players: [] as PlayerRow[],
      counts: { players: 0, clubs: 0, squads: 0, fixtures: 0 },
      error: error instanceof Error ? error.message : "Unable to load player database."
    };
  }
}
