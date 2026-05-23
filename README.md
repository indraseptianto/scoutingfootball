# ScoutFlow AI

AI recruitment intelligence for lower-tier football clubs.

This scaffold follows the PRD constraints:

- Next.js 15 App Router, TypeScript, Tailwind CSS v4, shadcn-style primitives.
- Supabase PostgreSQL/Auth-ready schema with RLS enabled.
- OpenAI GPT-4o structured scouting report service.
- Sportmonks Football API v3 as the single football data provider.
- Vercel cron configuration for scheduled sync jobs.

## Key Paths

- `src/lib/providers/sportmonks` - client, endpoint wrappers, rate limit, cache, normalizers, sync workers.
- `src/app/api/sync/[entity]/route.ts` - manual sync trigger for required `/api/sync/{entity}` routes.
- `src/app/api/cron/sync/route.ts` - Vercel Cron entrypoint protected by `CRON_SECRET`.
- `supabase/migrations/001_initial_schema.sql` - initial 20-table schema, indexes, generated columns, and RLS.
- `docs/deployment.md` - deployment checklist and setup flow.

## Local Setup

The current machine has a broken `npm` shim. After repairing npm:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Docker

The project includes a production Dockerfile using Next.js standalone output:

```bash
docker build -t scoutflow-ai .
docker run -p 3000:3000 --env-file .env.local scoutflow-ai
```

Vercel normally deploys this as a standard Next.js project from `package.json`; the Dockerfile is included for platforms that expect a container image.
