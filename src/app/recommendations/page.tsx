import { ArrowLeft, Brain, Filter, Search, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addPlayerToShortlist } from "@/app/shortlist/actions";
import {
  RecruitmentPlayer,
  buildRecruitmentScore,
  contractStatusForPlayer,
  formatDecimal,
  getRecruitmentDataset,
  per90,
  playerAge
} from "@/lib/recruitment-data";
import { getRecruitmentBrief } from "@/lib/recruitment-briefs";

type SearchParams = {
  brief?: string;
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
  const activeBrief = clean(params.brief) ? await getRecruitmentBrief(clean(params.brief)) : null;
  const filters = {
    briefId: activeBrief?.id ?? "",
    briefName: activeBrief?.name ?? "",
    roleArchetype: activeBrief?.role_archetype ?? "",
    budgetBand: activeBrief?.budget_band ?? "Value",
    position: clean(params.position) || activeBrief?.target_position || "",
    minAge: Number(params.minAge ?? String(activeBrief?.min_age ?? 16)) || 16,
    maxAge: Number(params.maxAge ?? String(activeBrief?.max_age ?? 26)) || 26,
    style: clean(params.style) || activeBrief?.tactical_style || "Press",
    contract: clean(params.contract) || activeBrief?.contract_preference || "Any",
    risk: clean(params.risk) || activeBrief?.risk_tolerance || "Medium",
    notes: clean(params.notes) || activeBrief?.notes || ""
  };
  const { players, error } = await getRecruitmentDataset(360);
  const positions = Array.from(new Set(players.map((player) => player.position_name).filter(Boolean) as string[])).sort();
  const recommendations = players
    .filter((player) => matchesFilters(player, filters))
    .map((player) => buildRecommendation(player, filters))
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
                {filters.briefId ? <input type="hidden" name="brief" value={filters.briefId} /> : null}
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
              The score now adapts more tightly to a saved brief when one is active.
            </p>
            {activeBrief ? (
              <div className="mt-6 rounded-md border border-accent/25 bg-accent-soft p-4 text-sm">
                <p className="font-semibold text-accent">Active brief: {activeBrief.name}</p>
                <p className="mt-2 text-muted">{activeBrief.club_name ?? "No club linked"} - {activeBrief.target_position} - {activeBrief.role_archetype} - {activeBrief.tactical_style} style - {activeBrief.budget_band} budget - {activeBrief.risk_tolerance} risk</p>
              </div>
            ) : null}
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
                        <form action={addPlayerToShortlist} className="contents">
                          <input type="hidden" name="sportmonksId" value={item.player.sportmonks_id} />
                          <input type="hidden" name="stage" value="watchlist" />
                          <input type="hidden" name="recruitmentBriefId" value={filters.briefId} />
                          <input type="hidden" name="recruitmentBriefName" value={filters.briefName} />
                          <input type="hidden" name="recruitmentRoleArchetype" value={filters.roleArchetype} />
                          <button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-secondary px-4 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/80">
                            <Target size={16} /> Add to Shortlist
                          </button>
                        </form>
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
                <CardContent className="grid gap-4 p-6 text-sm text-muted">
                  <p>No candidates match this recruitment brief yet.</p>
                  <div className="rounded-md border border-border bg-black/20 p-4">
                    <p className="font-medium text-foreground">Try widening the brief:</p>
                    <p className="mt-2">Use Contract Preference: Any, increase max age, or run batched players/transfers sync if you need expiring-contract recommendations.</p>
                    <Button className="mt-4" variant="secondary" asChild>
                      <a href={`/recommendations?${filters.briefId ? `brief=${encodeURIComponent(filters.briefId)}&` : ""}position=${encodeURIComponent(filters.position)}&minAge=${filters.minAge}&maxAge=${filters.maxAge}&style=${encodeURIComponent(filters.style)}&contract=Any&risk=${encodeURIComponent(filters.risk)}&notes=${encodeURIComponent(filters.notes)}`}>
                        Retry with contract Any
                      </a>
                    </Button>
                  </div>
                </CardContent>
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
  const contract = contractStatusForPlayer(player);
  if (filters.position && player.position_name !== filters.position) return false;
  if (age && (age < filters.minAge || age > filters.maxAge)) return false;
  if (filters.contract === "Expiring" && contract.urgency !== "high") return false;
  if (filters.contract === "Free Agent" && contract.label !== "Expired") return false;
  return true;
}

function buildRecommendation(
  player: RecruitmentPlayer,
  filters: {
    style: string;
    risk: string;
    roleArchetype: string;
    budgetBand: string;
    notes: string;
  }
) {
  const base = buildRecruitmentScore(player);
  const styleBonus = tacticalStyleBonus(player, filters.style);
  const roleBonus = roleArchetypeBonus(player, filters.roleArchetype);
  const budgetBonus = budgetBandBonus(player, filters.budgetBand);
  const scoutNoteBonus = filters.notes && roleTextMatch(player, filters.notes) ? 3 : 0;
  const samplePenalty = player.minutes < 450 && filters.risk === "Low" ? 12 : player.minutes < 450 && filters.risk === "Medium" ? 6 : 0;
  const contract = contractStatusForPlayer(player);
  const fitScore = Math.max(0, Math.min(100, Math.round(base + styleBonus + roleBonus + budgetBonus + scoutNoteBonus - samplePenalty)));
  const output = per90(player.goals + player.assists, player.minutes);
  const xgi = per90(player.expected_goals + player.expected_assists, player.minutes);
  const risk = player.minutes < 450 || contract.source !== "exact" ? "Medium" : contract.urgency === "high" && fitScore > 75 ? "Low" : "Medium";

  return {
    player,
    fitScore,
    risk,
    contractLabel: contract.label,
    justification: `${filters.style} fit + ${filters.roleArchetype || "general role"}: ${formatDecimal(output)} G+A/90, ${formatDecimal(xgi)} xGI/90, ${player.hidden_gem_score}/100 hidden-gem signal. ${contract.label} creates a ${contract.urgency} transfer-window opportunity.`
  };
}

function tacticalStyleBonus(player: RecruitmentPlayer, style: string) {
  if (style === "Press") return per90(player.tackles + player.interceptions + player.ball_recoveries, player.minutes) >= 6 ? 8 : 0;
  if (style === "Possession") return (player.pass_accuracy ?? 0) >= 78 || per90(player.key_passes, player.minutes) >= 1.4 ? 8 : 0;
  if (style === "Counter") return per90(player.goals + player.assists, player.minutes) >= 0.35 ? 8 : 0;
  if (style === "Direct") return player.shots_total >= 20 || per90(player.expected_goals, player.minutes) >= 0.25 ? 8 : 0;
  return 0;
}

function roleArchetypeBonus(player: RecruitmentPlayer, role: string) {
  if (role === "Ball-Winning Midfielder") return per90(player.tackles + player.interceptions + player.ball_recoveries, player.minutes) >= 6.5 ? 9 : 0;
  if (role === "Progression Fullback") return (player.pass_accuracy ?? 0) >= 76 && per90(player.key_passes, player.minutes) >= 0.8 ? 9 : 0;
  if (role === "Pressing Winger") return per90(player.goals + player.assists, player.minutes) >= 0.3 && per90(player.tackles + player.interceptions, player.minutes) >= 2.5 ? 9 : 0;
  if (role === "Penalty-Box Striker") return per90(player.expected_goals, player.minutes) >= 0.3 || player.shots_total >= 24 ? 9 : 0;
  if (role === "Build-Up Center Back") return (player.pass_accuracy ?? 0) >= 82 && per90(player.interceptions + player.ball_recoveries, player.minutes) >= 4 ? 9 : 0;
  if (role === "Creative Midfielder") return per90(player.key_passes, player.minutes) >= 1.6 || per90(player.expected_assists, player.minutes) >= 0.18 ? 9 : 0;
  if (role === "Box Crasher") return per90(player.goals + player.expected_goals, player.minutes) >= 0.38 ? 9 : 0;
  if (role === "Transition Fullback") return per90(player.key_passes, player.minutes) >= 0.9 && per90(player.tackles + player.ball_recoveries, player.minutes) >= 4.5 ? 9 : 0;
  return 0;
}

function budgetBandBonus(player: RecruitmentPlayer, budgetBand: string) {
  const age = playerAge(player.date_of_birth) ?? 28;
  if (budgetBand === "Value") return age <= 24 || player.hidden_gem_score >= 72 ? 6 : 0;
  if (budgetBand === "Balanced") return player.hidden_gem_score >= 65 ? 4 : 0;
  if (budgetBand === "Premium") return (player.rating ?? 0) >= 7 ? 5 : 0;
  return 0;
}

function roleTextMatch(player: RecruitmentPlayer, notes: string) {
  const haystack = `${player.position_name ?? ""} ${player.display_name} ${player.nationality_name ?? ""}`.toLowerCase();
  return notes.toLowerCase().split(/\s+/).filter(Boolean).some((token) => token.length >= 4 && haystack.includes(token));
}

function clean(value?: string) {
  return typeof value === "string" ? value.trim() : "";
}
