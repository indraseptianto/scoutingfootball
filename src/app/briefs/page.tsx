import { ArrowLeft, BriefcaseBusiness, CircleDot, Plus, Radar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  briefBudgetBands,
  briefContractOptions,
  briefRiskOptions,
  briefRoleArchetypes,
  briefStatuses,
  briefTacticalStyles,
  listClubOptions,
  listRecruitmentBriefs
} from "@/lib/recruitment-briefs";
import { createRecruitmentBrief, updateRecruitmentBriefStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function BriefsPage() {
  const [briefs, clubs] = await Promise.all([listRecruitmentBriefs(), listClubOptions()]);
  const activeCount = briefs.filter((brief) => brief.status === "active").length;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <Button variant="ghost" asChild><a href="/"><ArrowLeft size={16} /> Home</a></Button>

      <section className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <aside className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Plus size={18} /> New recruitment brief</CardTitle>
              <p className="text-sm text-muted">Save a role-specific brief, then reuse it for repeatable recommendation runs.</p>
            </CardHeader>
            <CardContent>
              <form action={createRecruitmentBrief} className="grid gap-4">
                <Field label="Brief name"><input name="name" className="input-like" placeholder="Summer RW succession plan" /></Field>
                <Field label="Club">
                  <select name="clubSportmonksId" className="input-like" defaultValue="">
                    <option value="">No club linked</option>
                    {clubs.map((club) => <option key={club.sportmonks_id} value={club.sportmonks_id}>{club.name}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Target position"><input name="targetPosition" className="input-like" placeholder="Right Winger" required /></Field>
                  <Field label="Role archetype">
                    <select name="roleArchetype" className="input-like" defaultValue={briefRoleArchetypes[0]}>
                      {briefRoleArchetypes.map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tactical style">
                    <select name="tacticalStyle" className="input-like" defaultValue={briefTacticalStyles[0]}>
                      {briefTacticalStyles.map((style) => <option key={style} value={style}>{style}</option>)}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select name="status" className="input-like" defaultValue="active">
                      {briefStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Min age"><input name="minAge" className="input-like" defaultValue="18" inputMode="numeric" /></Field>
                  <Field label="Max age"><input name="maxAge" className="input-like" defaultValue="26" inputMode="numeric" /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Contract preference">
                    <select name="contractPreference" className="input-like" defaultValue={briefContractOptions[0]}>
                      {briefContractOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </Field>
                  <Field label="Risk tolerance">
                    <select name="riskTolerance" className="input-like" defaultValue={briefRiskOptions[1]}>
                      {briefRiskOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Budget band">
                    <select name="budgetBand" className="input-like" defaultValue={briefBudgetBands[0]}>
                      {briefBudgetBands.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </Field>
                  <Field label="League focus"><input name="leagueFocus" className="input-like" placeholder="League One, Championship" /></Field>
                </div>
                <Field label="Notes"><textarea name="notes" rows={5} className="min-h-28 rounded-md border border-border bg-black/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" placeholder="Desired traits, succession context, wage concerns, coach feedback" /></Field>
                <Button type="submit"><BriefcaseBusiness size={16} /> Save brief</Button>
              </form>
            </CardContent>
          </Card>
        </aside>

        <section>
          <div className="rounded-lg border border-border bg-card p-6 md:p-8">
            <p className="flex items-center gap-2 text-sm font-medium text-accent"><Radar size={16} /> Recruitment Briefs</p>
            <h1 className="mt-3 text-4xl font-semibold">Persistent scouting context for every transfer need.</h1>
            <p className="mt-3 max-w-3xl text-muted">Briefs turn one-off filters into repeatable recruitment workflows. Save the role, constraints, and risk profile once, then reopen candidate rankings whenever fresh SportMonks data lands.</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <StatPill label="Saved briefs" value={String(briefs.length)} />
              <StatPill label="Active" value={String(activeCount)} />
              <StatPill label="Paused or draft" value={String(briefs.length - activeCount)} />
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {briefs.map((brief) => (
              <Card key={brief.id}>
                <CardContent className="p-5">
                  <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <a href={`/recommendations?brief=${brief.id}`} className="text-xl font-semibold hover:text-accent">{brief.name}</a>
                        <StatusBadge status={brief.status} />
                        <span className="rounded-md border border-border bg-white/[0.04] px-2 py-1 text-xs text-muted">{brief.target_position}</span>
                        <span className="rounded-md border border-border bg-white/[0.04] px-2 py-1 text-xs text-muted">{brief.role_archetype}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted">{brief.club_name ?? "No club linked"} - {brief.tactical_style} style - Ages {brief.min_age}-{brief.max_age} - {brief.contract_preference} contracts - {brief.budget_band} budget</p>
                      <p className="mt-4 leading-7 text-muted">{brief.notes ?? "No notes yet. This brief is ready to drive contextual recommendations."}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button asChild><a href={`/recommendations?brief=${brief.id}`}><Target size={16} /> Open recommendations</a></Button>
                        <Button variant="secondary" asChild><a href={`/shortlist`}><CircleDot size={16} /> Review shortlist</a></Button>
                      </div>
                    </div>
                    <form action={updateRecruitmentBriefStatus} className="grid gap-2 rounded-md border border-border bg-black/20 p-4 lg:w-48">
                      <input type="hidden" name="id" value={brief.id} />
                      <label className="grid gap-2 text-sm">
                        <span className="text-muted">Status</span>
                        <select name="status" defaultValue={brief.status} className="input-like">
                          {briefStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </label>
                      <Button variant="secondary" type="submit">Update</Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))}
            {briefs.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted">No recruitment briefs yet. Save your first role-specific brief to make recommendations persistent and reusable.</CardContent>
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

function StatPill({ label, value }: { label: string; value: string }) {
  return <span className="rounded-md border border-border bg-black/20 px-3 py-2"><span className="font-mono text-accent">{value}</span> <span className="text-muted">{label}</span></span>;
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === "active" ? "text-accent border-accent/30 bg-accent-soft" : status === "closed" ? "text-red-200 border-red-500/30 bg-red-500/10" : "text-amber-200 border-amber-400/30 bg-amber-500/10";
  return <span className={`rounded-md border px-2 py-1 text-xs ${tone}`}>{status}</span>;
}
