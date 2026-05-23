import { Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

type SearchParams = {
  q?: string;
};

type ClubRow = {
  sportmonks_id: number;
  name: string;
  short_code: string | null;
  image_path: string | null;
  squad_count: number;
};

export const dynamic = "force-dynamic";

export default async function ClubsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const { clubs, counts, error } = await getClubs(query);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-accent">Club Database</p>
          <h1 className="mt-2 text-3xl font-semibold">Squad coverage</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Clubs and squad sizes synced from your five Sportmonks trial leagues.
          </p>
        </div>
      </div>

      <form className="mt-8 grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[1fr_auto_auto]">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search club"
          className="h-10 rounded-md border border-border bg-black/20 px-3 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
        <Button type="submit"><Search size={16} /> Search</Button>
        <Button variant="secondary" asChild><a href="/clubs">Reset</a></Button>
      </form>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Metric label="Clubs" value={counts.clubs} />
        <Metric label="Squad Rows" value={counts.squads} />
        <Metric label="Players" value={counts.players} />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Synced clubs</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {clubs.map((club) => (
                <div key={club.sportmonks_id} className="rounded-md border border-border bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">{club.name}</h2>
                      <p className="mt-1 text-sm text-muted">{club.short_code ?? `ID ${club.sportmonks_id}`}</p>
                    </div>
                    <Users size={18} className="text-accent" />
                  </div>
                  <div className="mt-5 font-mono text-2xl text-accent">{club.squad_count}</div>
                  <p className="text-sm text-muted">squad rows</p>
                </div>
              ))}
              {clubs.length === 0 ? <p className="text-sm text-muted">No clubs found.</p> : null}
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

async function getClubs(query: string) {
  try {
    const supabase = getSupabaseServiceClient();
    const [clubsCount, squadsCount, playersCount] = await Promise.all([
      supabase.from("clubs").select("id", { count: "exact", head: true }),
      supabase.from("squad_players").select("id", { count: "exact", head: true }),
      supabase.from("players").select("id", { count: "exact", head: true })
    ]);

    let clubsQuery = supabase
      .from("clubs")
      .select("sportmonks_id,name,short_code,image_path")
      .order("name")
      .limit(120);

    if (query) clubsQuery = clubsQuery.ilike("name", `%${query}%`);

    const { data: clubRows, error } = await clubsQuery;
    if (error) throw error;

    const clubIds = (clubRows ?? []).map((club) => Number(club.sportmonks_id));
    const { data: squadRows } = await supabase
      .from("squad_players")
      .select("team_sportmonks_id")
      .in("team_sportmonks_id", clubIds);

    const squadCounts = new Map<number, number>();
    for (const row of squadRows ?? []) {
      const teamId = Number(row.team_sportmonks_id);
      squadCounts.set(teamId, (squadCounts.get(teamId) ?? 0) + 1);
    }

    const clubs = (clubRows ?? []).map((club) => ({
      ...club,
      squad_count: squadCounts.get(Number(club.sportmonks_id)) ?? 0
    })) as ClubRow[];

    return {
      clubs,
      counts: {
        clubs: clubsCount.count ?? 0,
        squads: squadsCount.count ?? 0,
        players: playersCount.count ?? 0
      },
      error: null
    };
  } catch (error) {
    return {
      clubs: [] as ClubRow[],
      counts: { clubs: 0, squads: 0, players: 0 },
      error: error instanceof Error ? error.message : "Unable to load clubs."
    };
  }
}
