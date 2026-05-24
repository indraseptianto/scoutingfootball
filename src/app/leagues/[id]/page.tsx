import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Database,
  Flag,
  Goal,
  LineChart,
  RefreshCw,
  Shield,
  Star,
  Trophy,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hiddenGemTier } from "@/lib/hidden-gem";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

type SearchParams = {
  season?: string;
};

type LeagueRow = {
  sportmonks_id: number;
  name: string;
  short_code: string | null;
  image_path: string | null;
  updated_at: string | null;
};

type SeasonRow = {
  sportmonks_id: number;
  name: string;
  is_current: boolean | null;
  starting_at: string | null;
  ending_at: string | null;
};

type ClubRow = {
  sportmonks_id: number;
  name: string;
  short_code: string | null;
  image_path: string | null;
};

type StandingRow = {
  team_sportmonks_id: number;
  position: number | null;
  points: number | null;
  played: number | null;
  won: number | null;
  drawn: number | null;
  lost: number | null;
  goals_for: number | null;
  goals_against: number | null;
  goal_difference: number | null;
};

type FixtureRow = {
  sportmonks_id: number;
  name: string | null;
  starting_at: string | null;
  result_info: string | null;
  home_team_sportmonks_id: number | null;
  away_team_sportmonks_id: number | null;
  home_score: number | null;
  away_score: number | null;
  raw: Record<string, unknown>;
};

type StatRow = {
  player_sportmonks_id: number;
  team_sportmonks_id: number | null;
  position_name: string | null;
  appearances: number | null;
  minutes: number | null;
  rating: number | string | null;
  goals: number | null;
  assists: number | null;
  shots_total: number | null;
  expected_goals: number | string | null;
  expected_assists: number | string | null;
  chances_created: number | null;
  tackles: number | null;
  interceptions: number | null;
  source: string;
};

type PlayerRow = {
  sportmonks_id: number;
  display_name: string;
  position_name: string | null;
  image_path: string | null;
  hidden_gem_score: number;
};

type TransferRow = {
  sportmonks_id: number;
  player_sportmonks_id: number | null;
  from_team_sportmonks_id: number | null;
  to_team_sportmonks_id: number | null;
  transfer_date: string | null;
  type_name: string | null;
};

type PlayerLeader = StatRow & {
  player: PlayerRow | null;
  club: ClubRow | null;
};

export const dynamic = "force-dynamic";

export default async function LeagueDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const data = await getLeagueDashboard(Number(id), query.season);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Button variant="ghost" asChild>
          <a href="/leagues"><ArrowLeft size={16} /> Leagues</a>
        </Button>

        {data.error ? (
          <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{data.error}</div>
        ) : data.league && data.season ? (
          <>
            <LeagueHero data={data} />
            <LeagueTabs leagueId={data.league.sportmonks_id} />

            <section className="mt-6 grid gap-3 md:grid-cols-4">
              <Metric label="Clubs" value={data.counts.clubs} detail="Current season squads" icon={<Shield size={18} />} />
              <Metric label="Players" value={data.counts.players} detail="Synced squad players" icon={<Users size={18} />} />
              <Metric label="Fixtures" value={data.counts.fixtures} detail="Cached match window" icon={<CalendarDays size={18} />} />
              <Metric label="Season Stats" value={data.counts.seasonStats} detail={data.statSourceLabel} icon={<LineChart size={18} />} />
            </section>

            <section id="overview" className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <LeagueTable standings={data.standings} />
              <FixturesPanel fixtures={data.fixtures} clubs={data.clubById} />
            </section>

            <section id="stats" className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
              <PlayerLeaders
                title="Top scorers"
                subtitle="Goals from cached season player statistics"
                icon={<Goal size={18} />}
                players={data.topScorers}
                metricLabel="G"
                metric={(row) => numberValue(row.goals)}
              />
              <PlayerLeaders
                title="Chance creators"
                subtitle="Assists plus creation indicators"
                icon={<Star size={18} />}
                players={data.creators}
                metricLabel="A"
                metric={(row) => numberValue(row.assists)}
              />
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <RecruitmentSignals gems={data.hiddenGems} />
              <TeamsPanel clubs={data.clubs} standings={data.standings} />
            </section>

            <section id="transfers" className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
              <TransfersPanel transfers={data.transfers} clubs={data.clubById} players={data.playerById} />
              <CachePanel data={data} />
            </section>
          </>
        ) : (
          <div className="mt-8 rounded-lg border border-border bg-card p-6">
            <h1 className="text-2xl font-semibold">League not found</h1>
            <p className="mt-2 text-muted">Run the leagues and seasons sync first, then reopen this page.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function LeagueHero({ data }: { data: Awaited<ReturnType<typeof getLeagueDashboard>> }) {
  if (!data.league || !data.season) return null;

  return (
    <section className="mt-5 overflow-hidden rounded-lg border border-border bg-card">
      <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
        <div className="bg-[linear-gradient(135deg,rgba(0,255,135,0.16),rgba(8,13,25,0)_56%)] p-6 md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <LeagueLogo league={data.league} size="lg" />
            <div>
              <p className="text-sm font-medium text-accent">League Profile</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-normal md:text-5xl">{data.league.name}</h1>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <Badge>{data.league.short_code ?? `Sportmonks ${data.league.sportmonks_id}`}</Badge>
                <Badge>{data.season.name}</Badge>
                <Badge>Sportmonks cache</Badge>
              </div>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-base leading-7 text-muted">
            Overview for recruitment analysts: standings context, squad coverage, cached fixtures,
            player output, hidden-gem signals, and recent market movement.
          </p>
        </div>

        <div className="border-t border-border p-6 lg:border-l lg:border-t-0">
          <div className="flex items-center gap-2 text-sm text-muted">
            <RefreshCw size={15} className="text-accent" />
            Cache status
          </div>
          <dl className="mt-5 grid gap-4 text-sm">
            <InfoRow label="Selected season" value={data.season.name} />
            <InfoRow label="Last cache update" value={formatDateTime(data.lastUpdated)} />
            <InfoRow label="Coverage" value={`${data.counts.seasonStats.toLocaleString()} stat rows`} />
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            {data.seasons.map((season) => (
              <a
                key={season.sportmonks_id}
                href={`/leagues/${data.league?.sportmonks_id}?season=${season.sportmonks_id}`}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  season.sportmonks_id === data.season?.sportmonks_id
                    ? "border-accent bg-accent text-black"
                    : "border-border bg-white/5 text-muted hover:text-foreground"
                }`}
              >
                {season.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LeagueTabs({ leagueId }: { leagueId: number }) {
  const tabs = [
    ["Overview", "#overview"],
    ["Table", "#table"],
    ["Fixtures", "#fixtures"],
    ["Player stats", "#stats"],
    ["Transfers", "#transfers"]
  ];

  return (
    <nav className="mt-4 flex gap-2 overflow-x-auto rounded-lg border border-border bg-card p-2">
      {tabs.map(([label, href], index) => (
        <a
          key={label}
          href={href === "#overview" ? `/leagues/${leagueId}` : href}
          className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition ${
            index === 0 ? "bg-accent text-black" : "text-muted hover:bg-white/5 hover:text-foreground"
          }`}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

function Metric({ label, value, detail, icon }: { label: string; value: number; detail: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm text-muted">{label}</CardTitle>
        <span className="text-accent">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-3xl font-semibold text-accent">{value.toLocaleString()}</div>
        <p className="mt-1 text-sm text-muted">{detail}</p>
      </CardContent>
    </Card>
  );
}

function LeagueTable({ standings }: { standings: Array<StandingRow & { club: ClubRow | null }> }) {
  return (
    <Card id="table" className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Table</CardTitle>
          <p className="mt-1 text-sm text-muted">Cached standings from Sportmonks.</p>
        </div>
        <Trophy size={18} className="text-accent" />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="grid min-w-[640px] grid-cols-[52px_1fr_64px_64px_64px_64px_70px] border-b border-border pb-3 text-xs font-medium uppercase text-muted">
            <span>Pos</span>
            <span>Club</span>
            <span>P</span>
            <span>W</span>
            <span>D</span>
            <span>L</span>
            <span>Pts</span>
          </div>
          {standings.slice(0, 12).map((row) => (
            <div
              key={`${row.team_sportmonks_id}-${row.position}`}
              className="grid min-w-[640px] grid-cols-[52px_1fr_64px_64px_64px_64px_70px] items-center border-b border-border py-3 text-sm last:border-0"
            >
              <span className="font-mono text-accent">{row.position ?? "-"}</span>
              <span className="flex items-center gap-3 font-medium">
                <LeagueLogo league={row.club} size="sm" />
                {row.club ? <a className="hover:text-accent" href={`/clubs/${row.club.sportmonks_id}`}>{row.club.name}</a> : "Unknown club"}
              </span>
              <span className="font-mono text-muted">{row.played ?? "-"}</span>
              <span className="font-mono text-muted">{row.won ?? "-"}</span>
              <span className="font-mono text-muted">{row.drawn ?? "-"}</span>
              <span className="font-mono text-muted">{row.lost ?? "-"}</span>
              <span className="font-mono font-semibold">{row.points ?? 0}</span>
            </div>
          ))}
          {standings.length === 0 ? <p className="py-8 text-sm text-muted">No cached table rows for this season.</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function FixturesPanel({ fixtures, clubs }: { fixtures: FixtureRow[]; clubs: Map<number, ClubRow> }) {
  return (
    <Card id="fixtures">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Fixtures</CardTitle>
          <p className="mt-1 text-sm text-muted">Recent and upcoming cached matches.</p>
        </div>
        <CalendarDays size={18} className="text-accent" />
      </CardHeader>
      <CardContent className="grid gap-3">
        {fixtures.map((fixture) => {
          const match = fixtureDisplay(fixture, clubs);
          return (
            <div key={fixture.sportmonks_id} className="rounded-md border border-border bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3 text-xs text-muted">
                <span>{formatDate(fixture.starting_at)}</span>
                <span className="font-mono">{fixture.sportmonks_id}</span>
              </div>
              <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
                <span className="truncate font-medium">{match.home}</span>
                <span className="rounded-md border border-border bg-white/5 px-3 py-1 font-mono text-accent">
                  {match.score}
                </span>
                <span className="truncate text-right font-medium">{match.away}</span>
              </div>
              <p className="mt-3 line-clamp-1 text-xs text-muted">{fixture.result_info ?? fixture.name ?? "Fixture cached"}</p>
            </div>
          );
        })}
        {fixtures.length === 0 ? <p className="text-sm text-muted">No cached fixtures for this league window.</p> : null}
      </CardContent>
    </Card>
  );
}

function PlayerLeaders({
  title,
  subtitle,
  icon,
  players,
  metricLabel,
  metric
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  players: PlayerLeader[];
  metricLabel: string;
  metric: (row: PlayerLeader) => number;
}) {
  const max = Math.max(1, ...players.map(metric));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <span className="text-accent">{icon}</span>
      </CardHeader>
      <CardContent className="grid gap-3">
        {players.map((row, index) => (
          <a
            key={`${row.player_sportmonks_id}-${title}`}
            href={`/players/${row.player_sportmonks_id}`}
            className="grid grid-cols-[32px_1fr_58px] items-center gap-3 rounded-md border border-border bg-black/20 p-3 transition hover:border-accent/60"
          >
            <span className="font-mono text-sm text-muted">{index + 1}</span>
            <span className="min-w-0">
              <span className="block truncate font-medium">{row.player?.display_name ?? `Player ${row.player_sportmonks_id}`}</span>
              <span className="mt-1 block truncate text-xs text-muted">{row.club?.name ?? "Unassigned"} - {row.player?.position_name ?? row.position_name ?? "Unknown"}</span>
              <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.max(6, (metric(row) / max) * 100)}%` }} />
              </span>
            </span>
            <span className="text-right font-mono text-lg text-accent">{metric(row)}<span className="ml-1 text-xs text-muted">{metricLabel}</span></span>
          </a>
        ))}
        {players.length === 0 ? <p className="text-sm text-muted">No cached player statistics for this category.</p> : null}
      </CardContent>
    </Card>
  );
}

function RecruitmentSignals({ gems }: { gems: PlayerLeader[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recruitment signals</CardTitle>
        <p className="mt-1 text-sm text-muted">Players worth monitoring from your cached squad and season data.</p>
      </CardHeader>
      <CardContent className="grid gap-3">
        {gems.map((row) => (
          <a
            key={`gem-${row.player_sportmonks_id}`}
            href={`/players/${row.player_sportmonks_id}`}
            className="flex items-center justify-between gap-3 rounded-md border border-border bg-black/20 p-3 transition hover:border-accent/60"
          >
            <span className="min-w-0">
              <span className="block truncate font-medium">{row.player?.display_name ?? `Player ${row.player_sportmonks_id}`}</span>
              <span className="mt-1 block text-xs text-muted">{row.club?.name ?? "Unassigned"} - {hiddenGemTier(row.player?.hidden_gem_score ?? 0)}</span>
            </span>
            <span className="font-mono text-2xl text-accent">{row.player?.hidden_gem_score ?? 0}</span>
          </a>
        ))}
        {gems.length === 0 ? <p className="text-sm text-muted">No hidden-gem scores available yet.</p> : null}
      </CardContent>
    </Card>
  );
}

function TeamsPanel({
  clubs,
  standings
}: {
  clubs: ClubRow[];
  standings: Array<StandingRow & { club: ClubRow | null }>;
}) {
  const positionByTeam = new Map(standings.map((row) => [row.team_sportmonks_id, row.position]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teams</CardTitle>
        <p className="mt-1 text-sm text-muted">Current season clubs cached for this league.</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {clubs.slice(0, 12).map((club) => (
            <a
              key={club.sportmonks_id}
              href={`/clubs/${club.sportmonks_id}`}
              className="flex items-center justify-between rounded-md border border-border bg-black/20 p-3 transition hover:border-accent/60"
            >
              <span className="flex min-w-0 items-center gap-3">
                <LeagueLogo league={club} size="sm" />
                <span className="truncate font-medium">{club.name}</span>
              </span>
              <span className="font-mono text-sm text-accent">#{positionByTeam.get(club.sportmonks_id) ?? "-"}</span>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TransfersPanel({
  transfers,
  clubs,
  players
}: {
  transfers: TransferRow[];
  clubs: Map<number, ClubRow>;
  players: Map<number, PlayerRow>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transfer activity</CardTitle>
          <p className="mt-1 text-sm text-muted">Recent market movement involving league clubs.</p>
        </div>
        <Flag size={18} className="text-accent" />
      </CardHeader>
      <CardContent className="grid gap-3">
        {transfers.map((transfer) => (
          <div key={transfer.sportmonks_id} className="rounded-md border border-border bg-black/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <a className="truncate font-medium hover:text-accent" href={`/players/${transfer.player_sportmonks_id}`}>
                {players.get(Number(transfer.player_sportmonks_id))?.display_name ?? `Player ${transfer.player_sportmonks_id}`}
              </a>
              <span className="rounded-full border border-border px-2 py-1 text-xs text-muted">{transfer.type_name ?? "Transfer"}</span>
            </div>
            <p className="mt-2 text-sm text-muted">
              {clubs.get(Number(transfer.from_team_sportmonks_id))?.name ?? "Unknown"} <ArrowRight className="inline" size={13} />{" "}
              {clubs.get(Number(transfer.to_team_sportmonks_id))?.name ?? "Unknown"}
            </p>
            <p className="mt-1 text-xs text-muted">{formatDate(transfer.transfer_date)}</p>
          </div>
        ))}
        {transfers.length === 0 ? <p className="text-sm text-muted">No cached transfers for this league yet.</p> : null}
      </CardContent>
    </Card>
  );
}

function CachePanel({ data }: { data: Awaited<ReturnType<typeof getLeagueDashboard>> }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Data pipeline</CardTitle>
          <p className="mt-1 text-sm text-muted">Sportmonks API v3 is the only football data source.</p>
        </div>
        <Database size={18} className="text-accent" />
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <InfoRow label="League cache" value={formatDateTime(data.league?.updated_at ?? null)} />
        <InfoRow label="Stats source" value={data.statSourceLabel} />
        <InfoRow label="Sync strategy" value="Cache-first, no live polling" />
        <div className="rounded-md border border-border bg-black/20 p-4 text-muted">
          To protect the 2,000-call trial quota, league pages read Supabase cache. Refresh Sportmonks data from Sync Admin or cron, then this dashboard updates automatically.
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-border bg-white/5 px-3 py-1 text-muted">{children}</span>;
}

function LeagueLogo({
  league,
  size = "md"
}: {
  league: Pick<LeagueRow | ClubRow, "name" | "image_path"> | null;
  size?: "sm" | "md" | "lg";
}) {
  const classes = {
    sm: "h-8 w-8 p-1",
    md: "h-12 w-12 p-2",
    lg: "h-20 w-20 p-3"
  }[size];

  if (league?.image_path) {
    return <img src={league.image_path} alt={`${league.name} logo`} className={`${classes} rounded-md border border-border bg-white object-contain`} />;
  }

  return (
    <span className={`${classes} flex items-center justify-center rounded-md border border-border bg-accent-soft text-accent`}>
      <Trophy size={size === "lg" ? 28 : 16} />
    </span>
  );
}

async function getLeagueDashboard(leagueId: number, seasonParam?: string) {
  try {
    const supabase = getSupabaseServiceClient();
    const { data: league, error: leagueError } = await supabase
      .from("leagues")
      .select("sportmonks_id,name,short_code,image_path,updated_at")
      .eq("sportmonks_id", leagueId)
      .maybeSingle();

    if (leagueError) throw leagueError;
    if (!league) {
      return emptyDashboard("League not found.");
    }

    const { data: seasons, error: seasonsError } = await supabase
      .from("seasons")
      .select("sportmonks_id,name,is_current,starting_at,ending_at")
      .eq("league_sportmonks_id", leagueId)
      .order("starting_at", { ascending: false });

    if (seasonsError) throw seasonsError;

    const seasonRows = (seasons ?? []).map(normalizeSeason);
    const selectedSeasonId = Number(seasonParam);
    const season =
      seasonRows.find((row) => row.sportmonks_id === selectedSeasonId) ??
      seasonRows.find((row) => row.is_current) ??
      seasonRows[0] ??
      null;

    if (!season) {
      return {
        ...emptyDashboard(null),
        league: normalizeLeague(league),
        seasons: seasonRows,
        error: null
      };
    }

    const [membershipsResult, standingsResult, fixturesResult, statsResult] = await Promise.all([
      supabase
        .from("club_season_memberships")
        .select("team_sportmonks_id")
        .eq("league_sportmonks_id", leagueId)
        .eq("season_sportmonks_id", season.sportmonks_id),
      supabase
        .from("standings")
        .select("team_sportmonks_id,position,points,played,won,drawn,lost,goals_for,goals_against,goal_difference")
        .eq("season_sportmonks_id", season.sportmonks_id)
        .order("position", { ascending: true }),
      supabase
        .from("fixtures")
        .select("sportmonks_id,name,starting_at,result_info,home_team_sportmonks_id,away_team_sportmonks_id,home_score,away_score,raw")
        .eq("league_sportmonks_id", leagueId)
        .eq("season_sportmonks_id", season.sportmonks_id)
        .order("starting_at", { ascending: false })
        .limit(12),
      supabase
        .from("season_player_statistics")
        .select("player_sportmonks_id,team_sportmonks_id,position_name,appearances,minutes,rating,goals,assists,shots_total,expected_goals,expected_assists,chances_created,tackles,interceptions,source")
        .eq("league_sportmonks_id", leagueId)
        .eq("season_sportmonks_id", season.sportmonks_id)
        .limit(900)
    ]);

    if (membershipsResult.error) throw membershipsResult.error;
    if (standingsResult.error) throw standingsResult.error;
    if (fixturesResult.error) throw fixturesResult.error;
    if (statsResult.error) throw statsResult.error;

    const teamIds = Array.from(new Set((membershipsResult.data ?? []).map((row) => Number(row.team_sportmonks_id)).filter(Boolean)));
    const [clubsResult, squadsResult] = await Promise.all([
      teamIds.length
        ? supabase.from("clubs").select("sportmonks_id,name,short_code,image_path").in("sportmonks_id", teamIds).order("name")
        : Promise.resolve({ data: [] }),
      teamIds.length
        ? supabase.from("squad_players").select("player_sportmonks_id,team_sportmonks_id").in("team_sportmonks_id", teamIds)
        : Promise.resolve({ data: [] })
    ]);

    const clubs = ((clubsResult.data ?? []) as Record<string, unknown>[]).map(normalizeClub);
    const clubById = new Map(clubs.map((club) => [club.sportmonks_id, club]));
    const stats = ((statsResult.data ?? []) as Record<string, unknown>[]).map(normalizeStat);

    const playerIds = Array.from(new Set([
      ...stats.map((row) => row.player_sportmonks_id),
      ...((squadsResult.data ?? []) as Record<string, unknown>[]).map((row) => Number(row.player_sportmonks_id)).filter(Boolean)
    ]));

    const playersResult = playerIds.length
      ? await supabase
          .from("players")
          .select("sportmonks_id,display_name,position_name,image_path,hidden_gem_score")
          .in("sportmonks_id", playerIds)
          .limit(1200)
      : { data: [] };

    const players = ((playersResult.data ?? []) as Record<string, unknown>[]).map(normalizePlayer);
    const playerById = new Map(players.map((player) => [player.sportmonks_id, player]));
    const leaders = stats.map((row) => ({
      ...row,
      player: playerById.get(row.player_sportmonks_id) ?? null,
      club: clubById.get(Number(row.team_sportmonks_id)) ?? null
    }));

    const transfers = await getLeagueTransfers(supabase, teamIds);
    const transferPlayerIds = transfers.map((row) => Number(row.player_sportmonks_id)).filter(Boolean);
    if (transferPlayerIds.length) {
      const missingIds = transferPlayerIds.filter((playerId) => !playerById.has(playerId));
      if (missingIds.length) {
        const { data: transferPlayers } = await supabase
          .from("players")
          .select("sportmonks_id,display_name,position_name,image_path,hidden_gem_score")
          .in("sportmonks_id", missingIds);
        for (const player of ((transferPlayers ?? []) as Record<string, unknown>[]).map(normalizePlayer)) {
          playerById.set(player.sportmonks_id, player);
        }
      }
    }

    const standings = ((standingsResult.data ?? []) as Record<string, unknown>[]).map((row) => ({
      ...normalizeStanding(row),
      club: clubById.get(Number(row.team_sportmonks_id)) ?? null
    }));

    return {
      league: normalizeLeague(league),
      seasons: seasonRows,
      season,
      clubs,
      clubById,
      playerById,
      standings,
      fixtures: ((fixturesResult.data ?? []) as Record<string, unknown>[]).map(normalizeFixture),
      transfers,
      topScorers: sortByMetric(leaders, (row) => numberValue(row.goals)).slice(0, 5),
      creators: sortByMetric(leaders, (row) => numberValue(row.assists) + numberValue(row.chances_created) * 0.2).slice(0, 5),
      hiddenGems: sortByMetric(leaders, (row) => row.player?.hidden_gem_score ?? 0).slice(0, 6),
      counts: {
        clubs: clubs.length,
        players: new Set(((squadsResult.data ?? []) as Record<string, unknown>[]).map((row) => Number(row.player_sportmonks_id)).filter(Boolean)).size,
        fixtures: fixturesResult.data?.length ?? 0,
        seasonStats: stats.length
      },
      lastUpdated: maxDate([league.updated_at as string | null, ...stats.map((row) => null)]),
      statSourceLabel: buildStatSourceLabel(stats),
      error: null
    };
  } catch (error) {
    return emptyDashboard(error instanceof Error ? error.message : "Unable to load league dashboard.");
  }
}

async function getLeagueTransfers(supabase: ReturnType<typeof getSupabaseServiceClient>, teamIds: number[]) {
  if (teamIds.length === 0) return [] as TransferRow[];
  const inList = teamIds.join(",");
  const { data } = await supabase
    .from("transfers")
    .select("sportmonks_id,player_sportmonks_id,from_team_sportmonks_id,to_team_sportmonks_id,transfer_date,type_name")
    .or(`from_team_sportmonks_id.in.(${inList}),to_team_sportmonks_id.in.(${inList})`)
    .order("transfer_date", { ascending: false })
    .limit(8);

  return ((data ?? []) as Record<string, unknown>[]).map(normalizeTransfer);
}

function emptyDashboard(error: string | null) {
  return {
    league: null as LeagueRow | null,
    seasons: [] as SeasonRow[],
    season: null as SeasonRow | null,
    clubs: [] as ClubRow[],
    clubById: new Map<number, ClubRow>(),
    playerById: new Map<number, PlayerRow>(),
    standings: [] as Array<StandingRow & { club: ClubRow | null }>,
    fixtures: [] as FixtureRow[],
    transfers: [] as TransferRow[],
    topScorers: [] as PlayerLeader[],
    creators: [] as PlayerLeader[],
    hiddenGems: [] as PlayerLeader[],
    counts: { clubs: 0, players: 0, fixtures: 0, seasonStats: 0 },
    lastUpdated: null as string | null,
    statSourceLabel: "No season stats cached",
    error
  };
}

function normalizeLeague(row: Record<string, unknown>): LeagueRow {
  return {
    sportmonks_id: Number(row.sportmonks_id),
    name: String(row.name ?? "Unknown league"),
    short_code: typeof row.short_code === "string" ? row.short_code : null,
    image_path: typeof row.image_path === "string" ? row.image_path : null,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : null
  };
}

function normalizeSeason(row: Record<string, unknown>): SeasonRow {
  return {
    sportmonks_id: Number(row.sportmonks_id),
    name: String(row.name ?? "Unknown season"),
    is_current: typeof row.is_current === "boolean" ? row.is_current : null,
    starting_at: typeof row.starting_at === "string" ? row.starting_at : null,
    ending_at: typeof row.ending_at === "string" ? row.ending_at : null
  };
}

function normalizeClub(row: Record<string, unknown>): ClubRow {
  return {
    sportmonks_id: Number(row.sportmonks_id),
    name: String(row.name ?? "Unknown club"),
    short_code: typeof row.short_code === "string" ? row.short_code : null,
    image_path: typeof row.image_path === "string" ? row.image_path : null
  };
}

function normalizeStanding(row: Record<string, unknown>): StandingRow {
  return {
    team_sportmonks_id: Number(row.team_sportmonks_id),
    position: nullableNumber(row.position),
    points: nullableNumber(row.points),
    played: nullableNumber(row.played),
    won: nullableNumber(row.won),
    drawn: nullableNumber(row.drawn),
    lost: nullableNumber(row.lost),
    goals_for: nullableNumber(row.goals_for),
    goals_against: nullableNumber(row.goals_against),
    goal_difference: nullableNumber(row.goal_difference)
  };
}

function normalizeFixture(row: Record<string, unknown>): FixtureRow {
  return {
    sportmonks_id: Number(row.sportmonks_id),
    name: typeof row.name === "string" ? row.name : null,
    starting_at: typeof row.starting_at === "string" ? row.starting_at : null,
    result_info: typeof row.result_info === "string" ? row.result_info : null,
    home_team_sportmonks_id: nullableNumber(row.home_team_sportmonks_id),
    away_team_sportmonks_id: nullableNumber(row.away_team_sportmonks_id),
    home_score: nullableNumber(row.home_score),
    away_score: nullableNumber(row.away_score),
    raw: isRecord(row.raw) ? row.raw : {}
  };
}

function normalizeStat(row: Record<string, unknown>): StatRow {
  return {
    player_sportmonks_id: Number(row.player_sportmonks_id),
    team_sportmonks_id: nullableNumber(row.team_sportmonks_id),
    position_name: typeof row.position_name === "string" ? row.position_name : null,
    appearances: nullableNumber(row.appearances),
    minutes: nullableNumber(row.minutes),
    rating: (row.rating as number | string | null) ?? null,
    goals: nullableNumber(row.goals),
    assists: nullableNumber(row.assists),
    shots_total: nullableNumber(row.shots_total),
    expected_goals: (row.expected_goals as number | string | null) ?? null,
    expected_assists: (row.expected_assists as number | string | null) ?? null,
    chances_created: nullableNumber(row.chances_created),
    tackles: nullableNumber(row.tackles),
    interceptions: nullableNumber(row.interceptions),
    source: typeof row.source === "string" ? row.source : "sportmonks"
  };
}

function normalizePlayer(row: Record<string, unknown>): PlayerRow {
  return {
    sportmonks_id: Number(row.sportmonks_id),
    display_name: String(row.display_name ?? "Unknown player"),
    position_name: typeof row.position_name === "string" ? row.position_name : null,
    image_path: typeof row.image_path === "string" ? row.image_path : null,
    hidden_gem_score: Number(row.hidden_gem_score ?? 0)
  };
}

function normalizeTransfer(row: Record<string, unknown>): TransferRow {
  return {
    sportmonks_id: Number(row.sportmonks_id),
    player_sportmonks_id: nullableNumber(row.player_sportmonks_id),
    from_team_sportmonks_id: nullableNumber(row.from_team_sportmonks_id),
    to_team_sportmonks_id: nullableNumber(row.to_team_sportmonks_id),
    transfer_date: typeof row.transfer_date === "string" ? row.transfer_date : null,
    type_name: typeof row.type_name === "string" ? row.type_name : null
  };
}

function fixtureDisplay(fixture: FixtureRow, clubs: Map<number, ClubRow>) {
  const homeId = fixture.home_team_sportmonks_id ?? participantIdFromRaw(fixture.raw, "home");
  const awayId = fixture.away_team_sportmonks_id ?? participantIdFromRaw(fixture.raw, "away");
  const fallback = fixture.name?.split(" vs ") ?? [];
  const home = clubs.get(Number(homeId))?.name ?? fallback[0] ?? "Home";
  const away = clubs.get(Number(awayId))?.name ?? fallback[1] ?? "Away";
  const score = fixture.home_score !== null && fixture.away_score !== null ? `${fixture.home_score}-${fixture.away_score}` : "vs";
  return { home, away, score };
}

function participantIdFromRaw(raw: Record<string, unknown>, location: "home" | "away") {
  const participants = Array.isArray(raw.participants) ? raw.participants.filter(isRecord) : [];
  const participant = participants.find((item) => {
    const meta = isRecord(item.meta) ? item.meta : {};
    return item.location === location || meta.location === location;
  });
  return nullableNumber(participant?.id ?? participant?.participant_id);
}

function sortByMetric<T>(rows: T[], metric: (row: T) => number) {
  return [...rows].sort((a, b) => metric(b) - metric(a));
}

function numberValue(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function nullableNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function buildStatSourceLabel(stats: StatRow[]) {
  if (stats.length === 0) return "No season stats cached";
  const sources = new Set(stats.map((row) => row.source));
  if (sources.has("sportmonks") && sources.has("match_aggregate")) return "Sportmonks + match aggregate";
  if (sources.has("match_aggregate")) return "Match aggregate fallback";
  return "Sportmonks season statistics";
}

function maxDate(values: Array<string | null>) {
  const timestamps = values.map((value) => (value ? new Date(value).getTime() : 0)).filter(Boolean);
  if (timestamps.length === 0) return null;
  return new Date(Math.max(...timestamps)).toISOString();
}

function formatDate(value: string | null) {
  if (!value) return "Unknown date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value: string | null) {
  if (!value) return "Not synced yet";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
