import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/auth/cron";
import { isSyncEntity, syncJobs, type SyncEntity } from "@/lib/providers/sportmonks/sync";
import type { SyncJobResult } from "@/lib/providers/sportmonks/sync/core";

const cronBatches: Record<string, SyncEntity[]> = {
  "daily-reference": ["countries", "positions", "leagues", "seasons", "teams"],
  "daily-market": ["squads", "fixtures", "standings", "transfers", "season-statistics", "statistics"]
};

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const job = request.nextUrl.searchParams.get("job") ?? "";
  if (job in cronBatches) {
    const results: SyncJobResult[] = [];
    for (const entity of cronBatches[job]) {
      const output = await syncJobs[entity]();
      results.push(...(Array.isArray(output) ? output : [output]));
    }

    const failed = results.some((result) => result.status === "failed");
    return NextResponse.json({ job, results }, { status: failed ? 500 : 200 });
  }

  if (!isSyncEntity(job)) {
    return NextResponse.json({ error: `Unknown cron sync job: ${job}` }, { status: 400 });
  }

  const output = await syncJobs[job]();
  const results = Array.isArray(output) ? output : [output];
  const failed = results.some((result) => result.status === "failed");
  return NextResponse.json(Array.isArray(output) ? results : results[0], { status: failed ? 500 : 200 });
}
