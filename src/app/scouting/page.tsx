import { ArrowLeft, BarChart3, Brain, CheckCircle2, CircleAlert, Search, ShieldCheck, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildScoutingSummary, contractStatusForPlayer, formatDecimal, getRecruitmentDataset, per90, playerAge } from "@/lib/recruitment-data";
import { hiddenGemTier } from "@/lib/hidden-gem";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { generateAndCacheScoutingReport } from "./actions";

type SearchParams = {
  player?: string;
  q?: string;
};

export const dynamic = "force-dynamic";

export default async function ScoutingPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const selectedId = Number(params.player ?? "0");
  const { players, error } = await getRecruitmentDataset(300);
  const selected = players.find((player) => player.sportmonks_id === selectedId) ?? players[0] ?? null;
  const matches = players
    .filter((player) => !query || player.display_name.toLowerCase().includes(query.toLowerCase()) || (player.club_name ?? "").toLowerCase().includes(query.toLowerCase()))
    .slice(0, 12);
  const report = selected ? buildScoutingSummary(selected) : null;
  const contract = selected ? contractStatusForPlayer(selected) : null;
  const aiReport = selected ? await getLatestAiReport(selected.id) : null;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <Button variant="ghost" asChild><a href="/"><ArrowLeft size={16} /> Home</a></Button>

      <section className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Search size={18} /> Player by 1</CardTitle>
              <p className="text-sm text-muted">Select one synced Sportmonks profile for a scouting readout.</p>
            </CardHeader>
            <CardContent>
              <form className="grid gap-3">
                <input name="q" defaultValue={query} placeholder="Search player or club" className="h-10 rounded-md border border-border bg-black/20 px-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
                <Button type="submit">Search</Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-2">
            {matches.map((player) => (
              <a
                key={player.sportmonks_id}
                href={`/scouting?player=${player.sportmonks_id}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={`rounded-md border p-3 transition ${selected?.sportmonks_id === player.sportmonks_id ? "border-accent bg-accent-soft" : "border-border bg-card hover:border-accent/60"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-medium">{player.display_name}</span>
                  <span className="font-mono text-accent">{player.hidden_gem_score}</span>
                </div>
                <p className="mt-1 truncate text-sm text-muted">{player.position_name ?? "Unknown"} - {player.club_name ?? "Unassigned"}</p>
              </a>
            ))}
          </div>
        </aside>

        <section>
          {!selected ? (
            <div className="mb-6 rounded-lg border border-border bg-card p-6 md:p-8">
              <p className="flex items-center gap-2 text-sm font-medium text-accent"><Brain size={16} /> Data Scouting Report</p>
              <h1 className="mt-3 text-4xl font-semibold">Scout one player from synced data.</h1>
              <p className="mt-3 max-w-2xl text-muted">Run Sportmonks sync to populate player profiles, then this workspace will generate a one-player scouting readout.</p>
            </div>
          ) : null}
          {error ? <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
          {selected && report && contract ? (
            <>
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
                  <div className="p-6 md:p-8">
                    <p className="flex items-center gap-2 text-sm font-medium text-accent"><Brain size={16} /> Data Scouting Report</p>
                    <h1 className="mt-3 text-4xl font-semibold">{selected.display_name}</h1>
                    <p className="mt-2 text-muted">{selected.position_name ?? "Unknown position"} - {selected.club_name ?? "Unassigned"} - {selected.nationality_name ?? "Unknown nationality"}</p>
                    <div className="mt-6 grid gap-3 md:grid-cols-4">
                      <HeroMetric label="Recommendation" value={report.recommendation} />
                      <HeroMetric label="Fit Score" value={String(report.score)} />
                      <HeroMetric label="Gem Tier" value={hiddenGemTier(selected.hidden_gem_score)} />
                      <HeroMetric label="Age" value={String(playerAge(selected.date_of_birth) ?? "-")} />
                    </div>
                  </div>
                  <div className="border-t border-border bg-black/20 p-6 lg:border-l lg:border-t-0">
                    <div className="font-mono text-6xl font-semibold text-accent">{report.score}</div>
                    <p className="mt-2 text-sm text-muted">One-player recruitment score from cached season production.</p>
                    <Button className="mt-6 w-full" asChild><a href={`/players/${selected.sportmonks_id}`}><BarChart3 size={16} /> Full visual stats</a></Button>
                  </div>
                </div>
              </div>

              <section className="mt-6 grid gap-4 lg:grid-cols-3">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 size={18} /> Strengths</CardTitle></CardHeader>
                  <CardContent className="grid gap-3">
                    {report.strengths.map((item) => <Bullet key={item} text={item} />)}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><CircleAlert size={18} /> Risks</CardTitle></CardHeader>
                  <CardContent className="grid gap-3">
                    {report.risks.map((item) => <Bullet key={item} text={item} />)}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Target size={18} /> Next action</CardTitle></CardHeader>
                  <CardContent>
                    <p className="leading-7 text-muted">{report.nextAction}</p>
                    <p className="mt-4 rounded-md border border-border bg-black/20 p-3 text-sm">{report.tacticalFit}</p>
                  </CardContent>
                </Card>
              </section>

              <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Metric icon={<Sparkles size={17} />} label="G+A /90" value={formatDecimal(per90(selected.goals + selected.assists, selected.minutes))} />
                <Metric icon={<Target size={17} />} label="xG+xA /90" value={formatDecimal(per90(selected.expected_goals + selected.expected_assists, selected.minutes))} />
                <Metric icon={<ShieldCheck size={17} />} label="Def actions /90" value={formatDecimal(per90(selected.tackles + selected.interceptions + selected.ball_recoveries, selected.minutes))} />
                <Metric icon={<BarChart3 size={17} />} label="Pass accuracy" value={selected.pass_accuracy ? `${selected.pass_accuracy.toFixed(1)}%` : "-"} />
              </section>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Brain size={18} /> AI scouting report</CardTitle>
                  <p className="text-sm text-muted">Generate once, cache in Supabase, and reuse for the same player.</p>
                </CardHeader>
                <CardContent className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                  <form action={generateAndCacheScoutingReport} className="grid gap-3">
                    <input type="hidden" name="sportmonksId" value={selected.sportmonks_id} />
                    <textarea
                      name="scoutNotes"
                      rows={6}
                      placeholder="Scout notes, tactical context, budget, role concerns"
                      className="min-h-32 rounded-md border border-border bg-black/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
                    />
                    <Button type="submit"><Brain size={16} /> Generate cached report</Button>
                  </form>

                  <div className="rounded-md border border-border bg-black/20 p-4">
                    {aiReport ? <AiReportView report={aiReport.report} createdAt={aiReport.created_at} /> : (
                      <p className="text-sm leading-6 text-muted">No cached AI report yet. Generate a report to save executive summary, strengths, weaknesses, tactical fit, risk, and final recommendation.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader><CardTitle>No player data</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted">Run the Sportmonks sync first, then return to this page.</CardContent>
            </Card>
          )}
        </section>
      </section>
    </main>
  );
}

function AiReportView({ report, createdAt }: { report: Record<string, unknown>; createdAt: string }) {
  const strengths = Array.isArray(report.strengths) ? report.strengths.map(String) : [];
  const weaknesses = Array.isArray(report.weaknesses) ? report.weaknesses.map(String) : [];
  return (
    <div className="grid gap-4">
      <div>
        <p className="text-xs uppercase text-muted">Cached {formatDateTime(createdAt)}</p>
        <h2 className="mt-2 text-xl font-semibold">{String(report.finalRecommendation ?? "Monitor")} - {String(report.recommendationScore ?? "-")}/100</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{String(report.executiveSummary ?? "No executive summary saved.")}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <ReportList title="Strengths" items={strengths} />
        <ReportList title="Weaknesses" items={weaknesses} />
      </div>
      <div className="rounded-md border border-border bg-white/[0.03] p-3 text-sm text-muted">
        {String(report.tacticalFit ?? "Tactical fit not generated yet.")}
      </div>
    </div>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-2 grid gap-2">
        {items.length > 0 ? items.map((item) => <p key={item} className="text-sm text-muted">{item}</p>) : <p className="text-sm text-muted">-</p>}
      </div>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-black/20 p-3">
      <div className="text-xs uppercase text-muted">{label}</div>
      <div className="mt-2 truncate font-semibold">{value}</div>
    </div>
  );
}

function Bullet({ text }: { text: string }) {
  return <p className="rounded-md border border-border bg-black/15 p-3 text-sm text-muted">{text}</p>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-muted">{icon}{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-3xl font-semibold text-accent">{value}</div>
      </CardContent>
    </Card>
  );
}

async function getLatestAiReport(playerId: string) {
  const supabase = getSupabaseServiceClient();
  const { data } = await supabase
    .from("ai_scouting_reports")
    .select("report,created_at")
    .eq("player_id", playerId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    report: isRecord(data.report) ? data.report : {},
    created_at: String(data.created_at)
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
