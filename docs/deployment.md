# ScoutFlow AI Deployment Guide

1. Repair or install npm, then run `npm install`.
2. Copy `.env.example` to `.env.local` and fill Supabase, OpenAI, Sportmonks, PostHog, Sentry, Resend, and `CRON_SECRET`.
3. Apply `supabase/migrations/001_initial_schema.sql` in Supabase.
4. Deploy to Vercel and configure the same environment variables.
5. Confirm cron invocations include `Authorization: Bearer $CRON_SECRET`.
6. Trigger initial syncs from `/admin/sync` or by POSTing to `/api/sync/leagues`, `/teams`, `/players`, `/squads`, `/fixtures`, `/standings`, `/transfers`, and `/statistics`.

Sportmonks Football API v3 is the only football data provider in this codebase.

The checked-in `vercel.json` uses two daily cron jobs so it can deploy on Vercel Hobby/Free projects. On Vercel Pro, you can split these back into more frequent per-entity cron jobs.
