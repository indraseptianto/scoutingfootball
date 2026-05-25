import { ArrowLeft, BellRing, CalendarClock, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contractStatus, getRecruitmentDataset, playerAge } from "@/lib/recruitment-data";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const { players, error } = await getRecruitmentDataset(300);
  const alerts = players
    .map((player) => ({ player, status: contractStatus(player.contract_expires_at) }))
    .sort((a, b) => b.status.score - a.status.score || b.player.hidden_gem_score - a.player.hidden_gem_score)
    .slice(0, 60);
  const high = alerts.filter((item) => item.status.urgency === "high").length;
  const medium = alerts.filter((item) => item.status.urgency === "medium").length;
  const unknown = alerts.filter((item) => item.status.label === "Unknown").length;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <Button variant="ghost" asChild><a href="/"><ArrowLeft size={16} /> Home</a></Button>
      <section className="mt-6 rounded-lg border border-border bg-card p-6 md:p-8">
        <p className="flex items-center gap-2 text-sm font-medium text-accent"><CalendarClock size={16} /> Contract Intelligence</p>
        <h1 className="mt-3 text-4xl font-semibold">Transfer feasibility alerts.</h1>
        <p className="mt-3 max-w-2xl text-muted">Prioritise targets with expiring or missing contract information using Sportmonks player metadata cached in Supabase.</p>
      </section>

      {error ? <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric title="High urgency" value={high} icon={<BellRing size={18} />} />
        <Metric title="Medium urgency" value={medium} icon={<CalendarClock size={18} />} />
        <Metric title="Unknown contracts" value={unknown} icon={<FileWarning size={18} />} />
      </section>

      <Card className="mt-6 overflow-hidden">
        <CardHeader>
          <CardTitle>Alert queue</CardTitle>
          <p className="text-sm text-muted">Sorted by contract opportunity and hidden-gem signal.</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid min-w-[920px] grid-cols-[1.35fr_0.85fr_1fr_0.7fr_0.85fr_0.9fr] border-b border-border pb-3 text-xs uppercase text-muted">
              <span>Player</span>
              <span>Position</span>
              <span>Club</span>
              <span>Age</span>
              <span>Signal</span>
              <span>Contract</span>
            </div>
            {alerts.map(({ player, status }) => (
              <a key={player.sportmonks_id} href={`/scouting?player=${player.sportmonks_id}`} className="grid min-w-[920px] grid-cols-[1.35fr_0.85fr_1fr_0.7fr_0.85fr_0.9fr] border-b border-border py-4 text-sm transition last:border-0 hover:text-accent">
                <span className="font-medium">{player.display_name}</span>
                <span className="text-muted">{player.position_name ?? "Unknown"}</span>
                <span className="truncate text-muted">{player.club_name ?? "Unassigned"}</span>
                <span className="font-mono">{playerAge(player.date_of_birth) ?? "-"}</span>
                <span className="font-mono">{player.hidden_gem_score}</span>
                <span className={status.urgency === "high" ? "text-red-200" : status.urgency === "medium" ? "text-yellow-100" : "text-muted"}>{status.label}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function Metric({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-muted">{title}</CardTitle>
        <span className="text-accent">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-3xl font-semibold text-accent">{value}</div>
      </CardContent>
    </Card>
  );
}
