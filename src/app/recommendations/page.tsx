import { ArrowLeft, Brain, Filter, Search, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RecruitmentPlayer,
  buildRecruitmentScore,
  contractStatus,
  formatDecimal,
  getRecruitmentDataset,
  per90,
  playerAge
} from "@/lib/recruitment-data";

type SearchParams = {
  position?: string;
  minAge?: string;
  maxAge?: string;
  style?: string;
  contract?: string;
  risk?: string;
  notes?: string;
};

const tacticalStyles = ["Possession", "Press", "Counter", "Direct"];
const riskOptions = ["Low", "Medium", "High"];

export const dynamic = "force-dynamic";

export default async function RecommendationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filters = {
    position: clean(params.position),
    minAge: Number(params.minAge ?? "16") || 16,
    maxAge: Number(params.maxAge ?? "26") || 26,
    style: clean(params.style) || "Press",
    contract: clean(params.contract) || "Any",
    risk: clean(params.risk) || "Medium",
    notes: clean(params.notes)
  };
  const { players, error } = await getRecruitmentDataset(360);
  const positions = Array.from(new Set(players.map((player) => player.position_name).filter(Boolean) as string[])).sort();
  const recommendations = players
    .filter((player) => matchesFilters(player, filters))
    .map((player) => buildRecommendation(player, filters.style, filters.risk))
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 20);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <Button variant="ghost" asChild><a href="/"><ArrowLeft size={16} /> Home</a></Button>

      <section className="mt-6 grid gap-6 xl:grid-cols-[390px_1fr]">
        <aside className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Filter size={18} /> Recommendation Engine</CardTitle>
              <p className="text-sm text-muted">Filter Sportmonks cache, then rank the top candidates with ScoutFlow scoring.</p>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4">
                <Field label="Target Position">
                  <select name="position" defaultValue={filters.position} className="input-like">
                    <option value="">Any position</option>
                    {positions.map((position) => <option key={position} value={position}>{position}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Min Age"><input className="input-like" name="minAge" defaultValue={filters.minAge} inputMode="numeric" /></Field>
                  <Field label="Max Age"><input className="input-like" name="maxAge" defaultValue={filters.maxAge} inputMode="numeric" /></Field>
                </div>
                <Field label="Tactical Style">
                  <select name="style" defaultValue={filters.style} className="input-like">
                    {tacticalStyles.map((style) => <option key={style} value={style}>{style}</option>)}
                  </select>
                </Field>
                <Field label="Contract Preference">
                  <select name="contract" defaultValue={filters.contract} className="input-like">
                    {["Any", "Expiring", "Free Agent"].map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Risk Tolerance">
                  <select name="risk" defaultValue={filters.risk} className="input-like">
                    {riskOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Notes untuk AI">
                  <textarea name="notes" defaultValue={filters.notes} rows={4} className="min-h-24 rounded-md border border-border bg-black/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" />
                </Field>
                <Button type="submit"><Search size={16} /> Generate ranking</Button>
              </form>
            </CardContent>
          </Card>
        </aside>

        <section>
          <div className="rounded-lg border border-border bg-card p-6 md:p-8">
            <p className="flex items-center gap-2 text-sm font-medium text-accent"><Brain size={16} /> Ranked Recommendations</p>
            <h1 className="mt-3 text-4xl font-semibold">Transfer targets matched to your recruitment brief.</h1>
            <p className="mt-3 max-w-3xl text-muted">
              This deterministic MVP mirrors the PRD flow without exposing Sportmonks tokens or calling AI on every page load.
              The score can later be passed into the existing OpenAI report pipeline for final AI justification.
            </p>
          </div>

          {error ? <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

          <div className="mt-6 grid gap-4">
            {recommendations.map((item, index) => (
              <Card key={item.player.sportmonks_id}>
                <CardContent className="p-5">
                  <div className="grid gap-5 lg:grid-cols-[44px_1fr_170px] lg:items-start">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-black/20 font-mono text-accent">{index + 1}</div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <a href={`/players/${item.player.sportmonks_id}`} className="text-xl font-semibold hover:text-accent">{item.player.display_name}</a>
                        <span className="rounded-md border border-border bg-white/[0.04] px-2 py-1 text-xs text-muted">{item.player.position_name ?? "Unknown"}</span>
                        <span className="rounded-md border border-border bg-white/[0.04] px-2 py-1 text-xs text-muted">{item.risk} risk</span>
                      </div>
                      <p className="mt-2 text-sm text-muted">{item.player.club_name ?? "Unassigned"} - Age {playerAge(item.player.date_of_birth) ?? "-"} - Contract: {item.contractLabel}</p>
                      <p className="mt-4 leading-7 text-muted">{item.justification}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="secondary" asChild><a href={`/players/${item.player.sportmonks_id}`}><TrendingUp size={16} /> View Profile</a></Button>
                        <Button variant="secondary" asChild><a href={`/scouting?player=${item.player.sportmonks_id}`}><Brain size={16} /> Full Report</a></Button>
                        <Button variant="secondary" asChild><a href="/shortlist"><Target size={16} /> Add to Shortlist</a></Button>
                      </div>
                    </div>
                    <div className="rounded-md border border-border bg-black/20 p-4 text-center">
                      <div className="text-xs uppercase text-muted">Fit Score</div>
                      <div className="mt-2 font-mono text-5xl font-semibold text-accent">{item.fitScore}</div>
                      <div className="mt-3 text-sm text-muted">{filters.style} model</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {recommendations.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted">No candidates match this recruitment brief yet.</CardContent>
              </Card>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  );
}

function matchesFilters(
  player: RecruitmentPlayer,
  filters: { position: string; minAge: number; maxAge: number; contract: string }
) {
  const age = playerAge(player.date_of_birth);
  const contract = contractStatus(player.contract_expires_at);
  if (filters.position && player.position_name !== filters.position) return false;
  if (age && (age < filters.minAge || age > filters.maxAge)) return false;
  if (filters.contract === "Expiring" && contract.urgency !== "high") return false;
  if (filters.contract === "Free Agent" && contract.label !== "Expired") return false;
  return true;
}

function buildRecommendation(player: RecruitmentPlayer, style: string, riskTolerance: string) {
  const base = buildRecruitmentScore(player);
  const styleBonus = tacticalStyleBonus(player, style);
  const samplePenalty = player.minutes < 450 && riskTolerance === "Low" ? 12 : player.minutes < 450 && riskTolerance === "Medium" ? 6 : 0;
  const contract = contractStatus(player.contract_expires_at);
  const fitScore = Math.max(0, Math.min(100, Math.round(base + styleBonus - samplePenalty)));
  const output = per90(player.goals + player.assists, player.minutes);
  const xgi = per90(player.expected_goals + player.expected_assists, player.minutes);
  const risk = player.minutes < 450 || !player.contract_expires_at ? "Medium" : contract.urgency === "high" && fitScore > 75 ? "Low" : "Medium";

  return {
    player,
    fitScore,
    risk,
    contractLabel: contract.label,
    justification: `${style} fit: ${formatDecimal(output)} G+A/90, ${formatDecimal(xgi)} xGI/90, ${player.hidden_gem_score}/100 hidden-gem signal. ${contract.label} creates a ${contract.urgency} transfer-window opportunity.`
  };
}

function tacticalStyleBonus(player: RecruitmentPlayer, style: string) {
  if (style === "Press") return per90(player.tackles + player.interceptions + player.ball_recoveries, player.minutes) >= 6 ? 8 : 0;
  if (style === "Possession") return (player.pass_accuracy ?? 0) >= 78 || per90(player.key_passes, player.minutes) >= 1.4 ? 8 : 0;
  if (style === "Counter") return per90(player.goals + player.assists, player.minutes) >= 0.35 ? 8 : 0;
  if (style === "Direct") return player.shots_total >= 20 || per90(player.expected_goals, player.minutes) >= 0.25 ? 8 : 0;
  return 0;
}

function clean(value?: string) {
  return typeof value === "string" ? value.trim() : "";
}
