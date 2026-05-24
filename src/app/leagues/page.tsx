import { ArrowRight, CalendarDays, Database, Shield, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

type LeagueSummary = {
  sportmonks_id: number;
  name: string;
  short_code: string | null;
  image_path: string | null;
  current_season_id: number | null;
  current_season_name: string | null;
  clubs: number;
  fixtures: number;
  player_stats: number;
  standings: number;
};

export const dynamic = "force-dynamic";

export default async function LeaguesPage() {
  const { leagues, totals, error } = await getLeagueSummaries();

  return (
    <main className="min-h-screen">
      <section className="border-b border-border bg-black/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium text-accent">Competition Intelligence</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-normal md:text-5xl">League overview</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
                Cache-first dashboards for the five Sportmonks leagues in your scouting workspace.
                Use each league page to inspect squads, standings, fixtures, transfers, and recruitment signals.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild><a href="/players">Player search <ArrowRight size={16} /></a></Button>
              <Button variant="secondary" asChild><a href="/admin/sync"><Database size={16} /> Sync admin</a></Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <Metric label="Target leagues" value={totals.leagues} icon={<Trophy size={18} />} />
            <Metric label="Synced clubs" value={totals.clubs} icon={<Shield size={18} />} />
            <Metric label="Cached fixtures" value={totals.fixtures} icon={<CalendarDays size={18} />} />
            <Metric label="Season stat rows" value={totals.player_stats} icon={<Users size={18} />} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {error ? (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-5">
            {leagues.map((league, index) => (
              <a
                key={league.sportmonks_id}
                href={`/leagues/${league.sportmonks_id}`}
                className="group rounded-lg border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-accent/60 hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-4">
                  <LeagueLogo league={league} />
                  <span className="rounded-full border border-border bg-white/5 px-2.5 py-1 font-mono text-xs text-muted">
                    #{index + 1}
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-semibold group-hover:text-accent">{league.name}</h2>
                <p className="mt-1 text-sm text-muted">{league.current_season_name ?? "Current season unknown"}</p>

                <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
                  <MiniStat label="Clubs" value={league.clubs} />
                  <MiniStat label="Fixtures" value={league.fixtures} />
                  <MiniStat label="Table" value={league.standings} />
                  <MiniStat label="Stats" value={league.player_stats} />
                </div>

                <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent">
                  Open league <ArrowRight size={15} />
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm text-muted">{label}</CardTitle>
        <span className="text-accent">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-3xl font-semibold text-accent">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-black/20 p-3">
      <div className="font-mono text-lg text-foreground">{value.toLocaleString()}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

function LeagueLogo({ league }: { league: Pick<LeagueSummary, "name" | "image_path"> }) {
  if (league.image_path) {
    return (
      <img
        src={league.image_path}
        alt={`${league.name} logo`}
        className="h-14 w-14 rounded-md border border-border bg-white object-contain p-2"
      />
    );
  }

  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-md border border-border bg-accent-soft text-accent">
      <Trophy size={22} />
    </div>
  );
}

async function getLeagueSummaries() {
  try {
    const supabase = getSupabaseServiceClient();
    const { data: leagueRows, error } = await supabase
      .from("leagues")
      .select("sportmonks_id,name,short_code,image_path")
      .order("name");

    if (error) throw error;

    const leagues = await Promise.all(
      (leagueRows ?? []).map(async (league) => {
        const leagueId = Number(league.sportmonks_id);
        const { data: season } = await supabase
          .from("seasons")
          .select("sportmonks_id,name")
          .eq("league_sportmonks_id", leagueId)
          .eq("is_current", true)
          .maybeSingle();

        const seasonId = season?.sportmonks_id ? Number(season.sportmonks_id) : null;
        const [clubs, fixtures, standings, playerStats] = await Promise.all([
          seasonId
            ? supabase
                .from("club_season_memberships")
                .select("id", { count: "exact", head: true })
                .eq("league_sportmonks_id", leagueId)
                .eq("season_sportmonks_id", seasonId)
            : Promise.resolve({ count: 0 }),
          seasonId
            ? supabase
                .from("fixtures")
                .select("id", { count: "exact", head: true })
                .eq("league_sportmonks_id", leagueId)
                .eq("season_sportmonks_id", seasonId)
            : Promise.resolve({ count: 0 }),
          seasonId
            ? supabase
                .from("standings")
                .select("id", { count: "exact", head: true })
                .eq("season_sportmonks_id", seasonId)
            : Promise.resolve({ count: 0 }),
          seasonId
            ? supabase
                .from("season_player_statistics")
                .select("id", { count: "exact", head: true })
                .eq("league_sportmonks_id", leagueId)
                .eq("season_sportmonks_id", seasonId)
            : Promise.resolve({ count: 0 })
        ]);

        return {
          sportmonks_id: leagueId,
          name: String(league.name),
          short_code: league.short_code as string | null,
          image_path: league.image_path as string | null,
          current_season_id: seasonId,
          current_season_name: (season?.name as string | undefined) ?? null,
          clubs: clubs.count ?? 0,
          fixtures: fixtures.count ?? 0,
          standings: standings.count ?? 0,
          player_stats: playerStats.count ?? 0
        } satisfies LeagueSummary;
      })
    );

    return {
      leagues,
      totals: {
        leagues: leagues.length,
        clubs: leagues.reduce((sum, league) => sum + league.clubs, 0),
        fixtures: leagues.reduce((sum, league) => sum + league.fixtures, 0),
        player_stats: leagues.reduce((sum, league) => sum + league.player_stats, 0)
      },
      error: null
    };
  } catch (error) {
    return {
      leagues: [] as LeagueSummary[],
      totals: { leagues: 0, clubs: 0, fixtures: 0, player_stats: 0 },
      error: error instanceof Error ? error.message : "Unable to load leagues."
    };
  }
}
