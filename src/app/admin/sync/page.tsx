import { Activity, DatabaseZap, LineChart, Percent, ShieldCheck, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

const jobs = [
  "countries",
  "positions",
  "leagues",
  "seasons",
  "teams",
  "players",
  "squads",
  "fixtures",
  "standings",
  "transfers",
  "season-statistics",
  "statistics"
];

export const dynamic = "force-dynamic";

export default async function AdminSyncPage() {
  const coverage = await getSyncCoverage();

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-black">
          <DatabaseZap size={20} />
        </div>
        <div>
          <p className="text-sm text-accent">Platform Admin</p>
          <h1 className="text-3xl font-semibold">Sportmonks sync control</h1>
        </div>
      </div>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <CoverageCard
          title="Contract exact"
          value={`${coverage.contract.exactPercent}%`}
          detail={`${coverage.contract.exact} of ${coverage.players.total} players have Sportmonks contract expiry dates.`}
          icon={<ShieldCheck size={18} />}
        />
        <CoverageCard
          title="Contract inferred"
          value={`${coverage.contract.inferredPercent}%`}
          detail={`${coverage.contract.inferred} players have transfer-history inference. Missing: ${coverage.contract.missing}.`}
          icon={<Percent size={18} />}
        />
        <CoverageCard
          title="Season stats coverage"
          value={`${coverage.statistics.playerCoveragePercent}%`}
          detail={`${coverage.statistics.playersWithStats} players with season stats from ${coverage.statistics.rows} rows.`}
          icon={<LineChart size={18} />}
        />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Timer size={18} /> Latest sync health</CardTitle>
            <p className="text-sm text-muted">Use these numbers before judging recommendations or contract filters.</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="grid min-w-[760px] grid-cols-[1fr_1fr_0.8fr_0.9fr_1.4fr] border-b border-border pb-3 text-xs uppercase text-muted">
                <span>Entity</span>
                <span>Status</span>
                <span>Records</span>
                <span>Latest</span>
                <span>Error</span>
              </div>
              {coverage.logs.map((log) => (
                <div key={log.entity} className="grid min-w-[760px] grid-cols-[1fr_1fr_0.8fr_0.9fr_1.4fr] border-b border-border py-3 text-sm last:border-0">
                  <span className="font-medium">{log.entity}</span>
                  <span className={log.status === "success" ? "text-accent" : "text-red-200"}>{log.status}</span>
                  <span className="font-mono">{log.records_processed}</span>
                  <span className="text-muted">{formatDateTime(log.started_at)}</span>
                  <span className="truncate text-muted">{log.error_message ?? "-"}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recommended sync next</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted">
            <p>1. Run batched `transfers` pages to improve contract inference and pending movement.</p>
            <p>2. Run `squads` after target teams/seasons so player metadata can update from team squads.</p>
            <p>3. Run `season-statistics` after fixtures/statistics for stable hidden-gem and fit scores.</p>
          </CardContent>
        </Card>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {jobs.map((job) => (
          <Card key={job}>
            <CardHeader>
              <CardTitle className="capitalize">{job}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted">POST `/api/sync/{job}` using the server-side Sportmonks token.</p>
              <Button variant="secondary" asChild>
                <a href={`/api/sync/logs`}><Activity size={16} /> View logs</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

async function getSyncCoverage() {
  const supabase = getSupabaseServiceClient();
  const [playersTotalResult, exactContractsResult, statsRowsResult, playerRows, transferRows, statsPlayerRows, latestLogs] = await Promise.all([
    supabase.from("players").select("*", { count: "exact", head: true }),
    supabase.from("players").select("*", { count: "exact", head: true }).not("contract_expires_at", "is", null),
    supabase.from("season_player_statistics").select("*", { count: "exact", head: true }),
    fetchAllRows<{ sportmonks_id: number | string | null; contract_expires_at: string | null }>("players", "sportmonks_id,contract_expires_at"),
    fetchAllRows<{ player_sportmonks_id: number | string | null }>("transfers", "player_sportmonks_id"),
    fetchAllRows<{ player_sportmonks_id: number | string | null }>("season_player_statistics", "player_sportmonks_id"),
    supabase.from("data_sync_logs").select("entity,status,records_processed,error_message,started_at").order("started_at", { ascending: false }).limit(80)
  ]);

  const playersTotal = playersTotalResult.count ?? 0;
  const exactContracts = exactContractsResult.count ?? 0;
  const statsRows = statsRowsResult.count ?? 0;
  const playerIds = new Set(playerRows.map((row) => Number(row.sportmonks_id)).filter(Boolean));
  const exactIds = new Set(playerRows.filter((row) => row.contract_expires_at).map((row) => Number(row.sportmonks_id)).filter(Boolean));
  const transferIds = new Set(transferRows.map((row) => Number(row.player_sportmonks_id)).filter(Boolean));
  const inferred = Array.from(transferIds).filter((id) => playerIds.has(id) && !exactIds.has(id)).length;
  const missing = Math.max(0, playersTotal - exactContracts - inferred);

  const playersWithStats = new Set(statsPlayerRows.map((row) => Number(row.player_sportmonks_id)).filter(Boolean)).size;
  const logs = latestByEntity((latestLogs.data ?? []) as SyncLogRow[]);

  return {
    players: {
      total: playersTotal
    },
    contract: {
      exact: exactContracts,
      inferred,
      missing,
      exactPercent: percent(exactContracts, playersTotal),
      inferredPercent: percent(inferred, playersTotal)
    },
    statistics: {
      rows: statsRows,
      playersWithStats,
      playerCoveragePercent: percent(playersWithStats, playersTotal)
    },
    logs
  };
}

async function fetchAllRows<T>(table: string, columns: string) {
  const supabase = getSupabaseServiceClient();
  const pageSize = 1000;
  const rows: T[] = [];

  for (let page = 0; page < 30; page += 1) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await supabase.from(table).select(columns).range(from, to);
    if (error) throw error;
    const pageRows = (data ?? []) as T[];
    rows.push(...pageRows);
    if (pageRows.length < pageSize) break;
  }

  return rows;
}

type SyncLogRow = {
  entity: string;
  status: string;
  records_processed: number;
  error_message: string | null;
  started_at: string;
};

function latestByEntity(rows: SyncLogRow[]) {
  const map = new Map<string, SyncLogRow>();
  for (const row of rows) {
    const entity = row.entity.split(":")[0] ?? row.entity;
    if (!map.has(entity)) map.set(entity, { ...row, entity });
  }
  return Array.from(map.values()).slice(0, 12);
}

function percent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function CoverageCard({ title, value, detail, icon }: { title: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-muted">{title}</CardTitle>
        <span className="text-accent">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-4xl font-semibold text-accent">{value}</div>
        <p className="mt-3 text-sm leading-6 text-muted">{detail}</p>
      </CardContent>
    </Card>
  );
}
