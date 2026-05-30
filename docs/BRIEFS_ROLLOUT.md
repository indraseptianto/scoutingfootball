# Briefs Rollout Guide

## Scope
This rollout enables the new recruitment brief workflow, contextual recommendations, and brief-aware shortlist tracking.

## Migrations to apply
Apply these Supabase migrations in order:

1. `supabase/migrations/004_recruitment_briefs.sql`
2. `supabase/migrations/005_shortlist_brief_context.sql`

## Recommended rollout steps
1. Back up the current database or ensure point-in-time recovery is available.
2. Run the two migrations in a staging environment first.
3. Verify the following tables/columns exist:
   - `recruitment_briefs`
   - `shortlist_players.recruitment_brief_id`
   - `shortlist_players.recruitment_brief_name`
   - `shortlist_players.recruitment_role_archetype`
4. Deploy the latest `main` application code.
5. Smoke test these paths:
   - `/briefs`
   - `/recommendations?brief=<brief_id>`
   - `/shortlist?brief=<brief_id>`
6. Create a sample brief, add one player to shortlist, and verify:
   - the shortlist card shows the brief badge
   - an automatic note is created
   - shortlist filtering by brief works

## Local commands
Install dependencies:

```bash
npm install
```

Run validation:

```bash
npm run typecheck
npm run build
```

## Supabase migration execution
Use your normal Supabase workflow. For example, if Supabase CLI is configured:

```bash
supabase db push
```

If you apply SQL manually, execute migration `004` before `005`.

## Rollback notes
If the app deploy must be rolled back, keep the migrations in place unless you are certain no data has been written to `recruitment_briefs` or the new shortlist metadata columns.

A safer rollback is:
1. revert the app code
2. keep the schema additions
3. re-deploy the previous stable app version

## Post-deploy checks
- `npm run typecheck` passes
- `npm run build` passes
- `/api/cron/sync` still returns valid responses for both single jobs and batch jobs
- recommendations and shortlist pages load without runtime errors
