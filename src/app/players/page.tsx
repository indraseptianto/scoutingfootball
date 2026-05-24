import { ChevronLeft, ChevronRight, Search, Shield, SlidersHorizontal, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { hiddenGemTier } from "@/lib/hidden-gem";

const PAGE_SIZE = 50;

type PlayerRow = {
  sportmonks_id: number;
  display_name: string;
  position_name: string | null;
  nationality_name: string | null;
  hidden_gem_score: number;
  club_name: string | null;
};

type SearchParams = {
  q?: string;
  position?: string;
  club?: string;
  page?: string;
};

export const dynamic = "force-dynamic";

export default async function PlayersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filters = {
    q: normalizeParam(params.q),
    position: normalizeParam(params.position),
    club: normalizeParam(params.club),
    page: Math.max(1, Number(params.page ?? "1") || 1)
  };
  const { players, counts, options, pagination, error } = await getPlayerDatabase(filters);

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
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" asChild><a href="/leagues"><Trophy size={16} /> Leagues</a></Button>
          <Button variant="secondary" asChild><a href="/clubs"><Shield size={16} /> Clubs</a></Button>
        </div>
      </div>

      <form className="mt-8 grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[1.5fr_1fr_1fr_auto_auto]">
        <label className="grid gap-2 text-sm">
          <span className="text-muted">Search</span>
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Player, nationality, club"
            className="h-10 rounded-md border border-border bg-black/20 px-3 text-sm outline-none focus:ring-2 focus:ring-accent"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-muted">Position</span>
          <select
            name="position"
            defaultValue={filters.position}
            className="h-10 rounded-md border border-border bg-black/20 px-3 text-sm outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All positions</option>
            {options.positions.map((position) => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-muted">Club</span>
          <select
            name="club"
            defaultValue={filters.club}
            className="h-10 rounded-md border border-border bg-black/20 px-3 text-sm outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All clubs</option>
            {options.clubs.map((club) => (
              <option key={club} value={club}>{club}</option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <Button className="w-full" type="submit"><Search size={16} /> Search</Button>
        </div>
        <div className="flex items-end">
          <Button variant="secondary" asChild className="w-full">
            <a href="/players"><SlidersHorizontal size={16} /> Reset</a>
          </Button>
        </div>
      </form>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Metric label="Players" value={counts.players} />
        <Metric label="Clubs" value={counts.clubs} />
        <Metric label="Squad Rows" value={counts.squads} />
        <Metric label="Fixtures" value={counts.fixtures} />
      </div>

      <Card className="mt-8 overflow-hidden">
        <CardHeader className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <CardTitle>Shortlist-ready profiles</CardTitle>
            <p className="mt-1 text-sm text-muted">
              Showing {pagination.from + 1}-{Math.min(pagination.to + 1, pagination.filteredTotal)} of {pagination.filteredTotal.toLocaleString()} matched players.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" asChild className={!pagination.hasPrevious ? "pointer-events-none opacity-50" : ""}>
              <a href={buildPageHref(filters, filters.page - 1)}><ChevronLeft size={16} /> Previous</a>
            </Button>
            <Button variant="secondary" asChild className={!pagination.hasNext ? "pointer-events-none opacity-50" : ""}>
              <a href={buildPageHref(filters, filters.page + 1)}>Next <ChevronRight size={16} /></a>
            </Button>
          </div>
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
                  key={`${player.sportmonks_id}-${player.club_name ?? "club"}`}
                  className="grid min-w-[860px] grid-cols-[1.4fr_0.9fr_1fr_1fr_0.7fr_0.8fr] border-b border-border py-4 text-sm last:border-0"
                >
                  <a className="font-medium hover:text-accent" href={`/players/${player.sportmonks_id}`}>{player.display_name}</a>
                  <span>{player.position_name ?? "Unknown"}</span>
                  <span className="text-muted">{player.nationality_name ?? "Unknown"}</span>
                  <span className="text-muted">{player.club_name ?? "Unassigned"}</span>
                  <span className="font-mono text-accent">{player.hidden_gem_score}</span>
                  <span className="inline-flex items-center gap-2"><Star size={14} className="text-accent" /> {hiddenGemTier(player.hidden_gem_score)}</span>
                </div>
              ))}
              {players.length === 0 ? <p className="py-8 text-sm text-muted">No players found for the current filters.</p> : null}
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

function normalizeParam(value?: string) {
  return typeof value === "string" ? value.trim() : "";
}

function buildPageHref(filters: { q: string; position: string; club: string }, page: number) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.position) params.set("position", filters.position);
  if (filters.club) params.set("club", filters.club);
  params.set("page", String(Math.max(1, page)));
  return `/players?${params.toString()}`;
}

async function getPlayerDatabase(filters: { q: string; position: string; club: string; page: number }) {
  try {
    const supabase = getSupabaseServiceClient();
    const from = (filters.page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const [playersCount, clubsCount, squadsCount, fixturesCount, positionsResult, clubsResult] = await Promise.all([
      supabase.from("players").select("id", { count: "exact", head: true }),
      supabase.from("clubs").select("id", { count: "exact", head: true }),
      supabase.from("squad_players").select("id", { count: "exact", head: true }),
      supabase.from("fixtures").select("id", { count: "exact", head: true }),
      supabase.from("players").select("position_name").not("position_name", "is", null).order("position_name"),
      supabase.from("clubs").select("name").order("name")
    ]);

    const positions = Array.from(new Set((positionsResult.data ?? []).map((row) => row.position_name as string).filter(Boolean)));
    const clubs = Array.from(new Set((clubsResult.data ?? []).map((row) => row.name as string).filter(Boolean)));

    let clubFilteredPlayerIds: number[] | null = null;

    if (filters.club) {
      const { data: matchingClub } = await supabase
        .from("clubs")
        .select("sportmonks_id")
        .eq("name", filters.club)
        .maybeSingle();

      const { data: matchingSquads } = await supabase
        .from("squad_players")
        .select("player_sportmonks_id")
        .eq("team_sportmonks_id", matchingClub?.sportmonks_id ?? -1);

      clubFilteredPlayerIds = Array.from(new Set((matchingSquads ?? []).map((row) => Number(row.player_sportmonks_id)).filter(Boolean)));
    }

    let playerQuery = supabase
      .from("players")
      .select("sportmonks_id,display_name,position_name,nationality_name,hidden_gem_score", { count: "exact" });

    if (clubFilteredPlayerIds) {
      playerQuery = clubFilteredPlayerIds.length > 0 ? playerQuery.in("sportmonks_id", clubFilteredPlayerIds) : playerQuery.eq("sportmonks_id", -1);
    }
    if (filters.position) playerQuery = playerQuery.eq("position_name", filters.position);
    if (filters.q) {
      playerQuery = playerQuery.or(
        `display_name.ilike.%${escapeLike(filters.q)}%,nationality_name.ilike.%${escapeLike(filters.q)}%`
      );
    }

    const { data: playerRows, count: filteredTotal, error: playersError } = await playerQuery
      .order("display_name", { ascending: true })
      .range(from, to);

    if (playersError) throw playersError;

    const playerIds = Array.from(new Set((playerRows ?? []).map((row) => Number(row.sportmonks_id)).filter(Boolean)));
    const { data: squadRows } = playerIds.length > 0
      ? await supabase
          .from("squad_players")
          .select("player_sportmonks_id,team_sportmonks_id")
          .in("player_sportmonks_id", playerIds)
      : { data: [] };

    const teamIds = Array.from(new Set((squadRows ?? []).map((row) => Number(row.team_sportmonks_id)).filter(Boolean)));
    const { data: clubRows } =
      teamIds.length > 0
        ? await supabase.from("clubs").select("sportmonks_id,name").in("sportmonks_id", teamIds)
        : { data: [] };

    const playerById = new Map(((playerRows ?? []) as PlayerRow[]).map((player) => [player.sportmonks_id, player]));
    const teamByPlayer = new Map((squadRows ?? []).map((row) => [Number(row.player_sportmonks_id), Number(row.team_sportmonks_id)]));
    const clubByTeam = new Map((clubRows ?? []).map((row) => [Number(row.sportmonks_id), row.name as string]));

    const players = Array.from(playerById.values())
      .map((player) => {
        return {
          ...player,
          club_name: clubByTeam.get(teamByPlayer.get(player.sportmonks_id) ?? 0) ?? null
        };
      })
      .sort((a, b) => a.display_name.localeCompare(b.display_name));

    return {
      players,
      counts: {
        players: playersCount.count ?? 0,
        clubs: clubsCount.count ?? 0,
        squads: squadsCount.count ?? 0,
        fixtures: fixturesCount.count ?? 0
      },
      options: { positions, clubs },
      pagination: {
        from,
        to,
        filteredTotal: filteredTotal ?? 0,
        hasPrevious: filters.page > 1,
        hasNext: to + 1 < (filteredTotal ?? 0)
      },
      error: null
    };
  } catch (error) {
    return {
      players: [] as PlayerRow[],
      counts: { players: 0, clubs: 0, squads: 0, fixtures: 0 },
      options: { positions: [] as string[], clubs: [] as string[] },
      pagination: { from: 0, to: 0, filteredTotal: 0, hasPrevious: false, hasNext: false },
      error: error instanceof Error ? error.message : "Unable to load player database."
    };
  }
}

function escapeLike(value: string) {
  return value.replaceAll("%", "\\%").replaceAll("_", "\\_").replaceAll(",", "");
}
