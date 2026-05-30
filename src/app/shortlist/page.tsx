import { ArrowLeft, ClipboardList, Download, MessageSquareText, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildRecruitmentScore, formatDecimal, getRecruitmentDataset, per90, playerAge } from "@/lib/recruitment-data";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { addPlayerToShortlist, addShortlistNote, getOrCreateDefaultShortlist, moveShortlistPlayer } from "./actions";
import { listRecruitmentBriefs } from "@/lib/recruitment-briefs";

const stages = [
  { key: "watchlist", title: "Watchlist" },
  { key: "scout_further", title: "Scout Further" },
  { key: "priority_target", title: "Priority Target" },
  { key: "negotiation", title: "Negotiation" },
  { key: "rejected", title: "Rejected" }
];

type BoardCard = {
  id: string;
  stage: string;
  latest_note: string | null;
  note_count: number;
  recruitment_brief_name: string | null;
  recruitment_role_archetype: string | null;
  player: {
    sportmonks_id: number;
    display_name: string;
    position_name: string | null;
    nationality_name: string | null;
    date_of_birth: string | null;
    hidden_gem_score: number;
  };
};

export const dynamic = "force-dynamic";

type ShortlistSearchParams = {
  brief?: string;
};

export default async function ShortlistPage({ searchParams }: { searchParams: Promise<ShortlistSearchParams> }) {
  const params = await searchParams;
  const activeBriefId = typeof params.brief === "string" ? params.brief.trim() : "";
  const [board, dataset, briefs] = await Promise.all([getShortlistBoard(activeBriefId), getRecruitmentDataset(220), listRecruitmentBriefs()]);
  const activeBrief = briefs.find((brief) => brief.id === activeBriefId) ?? null;
  const candidates = dataset.players
    .filter((player) => !board.cards.some((card) => card.player.sportmonks_id === player.sportmonks_id))
    .map((player) => ({ player, score: buildRecruitmentScore(player) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <Button variant="ghost" asChild><a href="/"><ArrowLeft size={16} /> Home</a></Button>
      <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-accent"><ClipboardList size={16} /> Transfer Shortlist</p>
          <h1 className="mt-2 text-4xl font-semibold">Recruitment board</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Persistent shortlist with stages, notes, and CSV export. The workspace board can later be scoped to club members after auth/RBAC.
          </p>
          {activeBrief ? (
            <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-md border border-accent/25 bg-accent-soft px-3 py-2 text-sm">
              <span className="font-semibold text-accent">Scoped brief:</span>
              <span>{activeBrief.name}</span>
              <span className="text-muted">{activeBrief.target_position} - {activeBrief.role_archetype}</span>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" asChild><a href={activeBriefId ? `/recommendations?brief=${encodeURIComponent(activeBriefId)}` : "/recommendations"}><Star size={16} /> Back to recommendations</a></Button>
          <Button variant="secondary" asChild><a href="/hidden-gems"><Star size={16} /> Add from gems</a></Button>
          <Button asChild><a href="/api/shortlist/export"><Download size={16} /> Export CSV</a></Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <a href="/shortlist" className={`rounded-md border px-3 py-2 ${!activeBriefId ? "border-accent/30 bg-accent-soft text-accent" : "border-border bg-black/20 text-muted"}`}>All shortlist items</a>
        {briefs.slice(0, 8).map((brief) => (
          <a
            key={brief.id}
            href={`/shortlist?brief=${encodeURIComponent(brief.id)}`}
            className={`rounded-md border px-3 py-2 ${activeBriefId === brief.id ? "border-accent/30 bg-accent-soft text-accent" : "border-border bg-black/20 text-muted"}`}
          >
            {brief.name}
          </a>
        ))}
      </div>

      {board.error ? <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{board.error}</div> : null}
      {dataset.error ? <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{dataset.error}</div> : null}

      <section className="mt-6 grid gap-4 xl:grid-cols-5">
        {stages.map((stage) => {
          const stageCards = board.cards.filter((card) => card.stage === stage.key);
          return (
            <Card key={stage.key} className="min-h-[520px]">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{stage.title}</CardTitle>
                  <span className="rounded-md border border-border bg-black/20 px-2 py-1 font-mono text-sm text-accent">{stageCards.length}</span>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                {stageCards.map((card) => (
                  <div key={card.id} className="rounded-md border border-border bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <a href={`/scouting?player=${card.player.sportmonks_id}`} className="block truncate font-semibold hover:text-accent">{card.player.display_name}</a>
                        <p className="mt-1 truncate text-sm text-muted">
                          {card.player.position_name ?? "Unknown"} - Age {playerAge(card.player.date_of_birth) ?? "-"}
                        </p>
                      </div>
                      <span className="font-mono text-accent">{card.player.hidden_gem_score}</span>
                    </div>
                    {(card.recruitment_brief_name || card.recruitment_role_archetype) ? (
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {card.recruitment_brief_name ? <span className="rounded-md border border-accent/30 bg-accent-soft px-2 py-1 text-accent">{card.recruitment_brief_name}</span> : null}
                        {card.recruitment_role_archetype ? <span className="rounded-md border border-border bg-white/[0.04] px-2 py-1 text-muted">{card.recruitment_role_archetype}</span> : null}
                      </div>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <MoveForm id={card.id} currentStage={card.stage} />
                    </div>
                    <div className="mt-4 rounded-md border border-border bg-white/[0.03] p-3">
                      <p className="flex items-center gap-2 text-xs text-muted"><MessageSquareText size={13} /> {card.note_count} notes</p>
                      {card.latest_note ? <p className="mt-2 text-sm">{card.latest_note}</p> : <p className="mt-2 text-sm text-muted">No notes yet.</p>}
                    </div>
                    <form action={addShortlistNote} className="mt-3 grid gap-2">
                      <input type="hidden" name="shortlistPlayerId" value={card.id} />
                      <input name="note" placeholder="Add scout note" className="h-9 rounded-md border border-border bg-black/20 px-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
                      <Button variant="secondary" type="submit">Save note</Button>
                    </form>
                  </div>
                ))}
                {stageCards.length === 0 ? <p className="text-sm text-muted">No players in this lane yet.</p> : null}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Suggested candidates</CardTitle>
          <p className="text-sm text-muted">Add data-ranked players into the persistent board.</p>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {candidates.map(({ player, score }) => (
            <div key={player.sportmonks_id} className="rounded-md border border-border bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{player.display_name}</h2>
                  <p className="mt-1 truncate text-sm text-muted">{player.position_name ?? "Unknown"} - {player.club_name ?? "Unassigned"}</p>
                </div>
                <span className="font-mono text-accent">{score}</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <Mini label="G+A/90" value={formatDecimal(per90(player.goals + player.assists, player.minutes))} />
                <Mini label="xGI/90" value={formatDecimal(per90(player.expected_goals + player.expected_assists, player.minutes))} />
                <Mini label="Gem" value={String(player.hidden_gem_score)} />
              </div>
              <form action={addPlayerToShortlist} className="mt-4">
                <input type="hidden" name="sportmonksId" value={player.sportmonks_id} />
                <input type="hidden" name="stage" value="watchlist" />
                <input type="hidden" name="recruitmentBriefId" value={activeBrief?.id ?? ""} />
                <input type="hidden" name="recruitmentBriefName" value={activeBrief?.name ?? ""} />
                <input type="hidden" name="recruitmentRoleArchetype" value={activeBrief?.role_archetype ?? ""} />
                <Button className="w-full" type="submit"><Plus size={16} /> Add</Button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

function MoveForm({ id, currentStage }: { id: string; currentStage: string }) {
  return (
    <form action={moveShortlistPlayer} className="grid w-full grid-cols-[1fr_auto] gap-2">
      <input type="hidden" name="shortlistPlayerId" value={id} />
      <select name="stage" defaultValue={currentStage} className="h-9 rounded-md border border-border bg-black/20 px-2 text-sm outline-none focus:ring-2 focus:ring-accent">
        {stages.map((stage) => <option key={stage.key} value={stage.key}>{stage.title}</option>)}
      </select>
      <Button variant="secondary" type="submit">Move</Button>
    </form>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-md border border-border bg-white/[0.03] p-2">
      <span className="block font-mono text-accent">{value}</span>
      <span className="mt-1 block text-muted">{label}</span>
    </span>
  );
}

async function getShortlistBoard(activeBriefId?: string) {
  try {
    const supabase = getSupabaseServiceClient();
    const shortlist = await getOrCreateDefaultShortlist();
    let query = supabase
      .from("shortlist_players")
      .select("id,stage,player_id,created_at,recruitment_brief_id,recruitment_brief_name,recruitment_role_archetype")
      .eq("shortlist_id", shortlist.id);

    if (activeBriefId) {
      query = query.eq("recruitment_brief_id", activeBriefId);
    }

    const { data: shortlistPlayers, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    const playerIds = (shortlistPlayers ?? []).map((row) => String(row.player_id));
    const [playersResult, notesResult] = await Promise.all([
      playerIds.length > 0
        ? supabase
            .from("players")
            .select("id,sportmonks_id,display_name,position_name,nationality_name,date_of_birth,hidden_gem_score")
            .in("id", playerIds)
        : Promise.resolve({ data: [] }),
      (shortlistPlayers ?? []).length > 0
        ? supabase
            .from("shortlist_notes")
            .select("shortlist_player_id,note,created_at")
            .in("shortlist_player_id", (shortlistPlayers ?? []).map((row) => String(row.id)))
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] })
    ]);

    const playerById = new Map((playersResult.data ?? []).map((player) => [String(player.id), player]));
    const notesByShortlistPlayer = new Map<string, Array<{ note: string; created_at: string }>>();
    for (const note of (notesResult.data ?? []) as Array<{ shortlist_player_id: string; note: string; created_at: string }>) {
      const key = String(note.shortlist_player_id);
      notesByShortlistPlayer.set(key, [...(notesByShortlistPlayer.get(key) ?? []), note]);
    }

    return {
      cards: (shortlistPlayers ?? []).flatMap((row) => {
        const player = playerById.get(String(row.player_id));
        if (!player) return [];
        const notes = notesByShortlistPlayer.get(String(row.id)) ?? [];
        return [{
          id: String(row.id),
          stage: String(row.stage),
          latest_note: notes[0]?.note ?? null,
          note_count: notes.length,
          recruitment_brief_name: typeof row.recruitment_brief_name === "string" ? row.recruitment_brief_name : null,
          recruitment_role_archetype: typeof row.recruitment_role_archetype === "string" ? row.recruitment_role_archetype : null,
          player: {
            sportmonks_id: Number(player.sportmonks_id),
            display_name: String(player.display_name),
            position_name: typeof player.position_name === "string" ? player.position_name : null,
            nationality_name: typeof player.nationality_name === "string" ? player.nationality_name : null,
            date_of_birth: typeof player.date_of_birth === "string" ? player.date_of_birth : null,
            hidden_gem_score: Number(player.hidden_gem_score ?? 0)
          }
        } satisfies BoardCard];
      }),
      error: null
    };
  } catch (error) {
    return {
      cards: [] as BoardCard[],
      error: error instanceof Error ? error.message : "Unable to load shortlist."
    };
  }
}
