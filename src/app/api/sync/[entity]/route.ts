import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/auth/cron";
import { isSyncEntity, syncJobs } from "@/lib/providers/sportmonks/sync";

export async function POST(request: NextRequest, context: { params: Promise<{ entity: string }> }) {
  if (!isAuthorizedCronRequest(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { entity } = await context.params;

  if (!isSyncEntity(entity)) {
    return NextResponse.json({ error: `Unknown sync entity: ${entity}` }, { status: 404 });
  }

  const payload = await request.json().catch(() => ({}));
  const job = syncJobs[entity] as (...args: string[]) => Promise<unknown>;
  const result = (await runJob(entity, job, payload)) as { status: "success" | "failed" };

  return NextResponse.json(result, { status: result.status === "success" ? 200 : 500 });
}

function runJob(entity: string, job: (...args: string[]) => Promise<unknown>, payload: { teamId?: string; seasonId?: string; refresh?: boolean; page?: string | number; maxPages?: string | number }) {
  if (entity === "players") return job(String(payload.page ?? ""), String(payload.maxPages ?? ""));
  if (entity === "squads") return job(payload.teamId ?? "", payload.seasonId ?? "");
  if (entity === "standings" || entity === "season-statistics") return job(payload.seasonId ?? "");
  if (entity === "statistics") return job(payload.seasonId ?? "", payload.refresh ? "refresh" : "");
  return job();
}
