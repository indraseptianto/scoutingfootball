# Production Checklist

- Supabase schema migrated and RLS enabled.
- `SPORTMONKS_API_TOKEN` is server-only and never exposed with `NEXT_PUBLIC_`.
- Sync logs are reviewed after each manual and cron run.
- OpenAI report generation validates JSON output with Zod.
- Vercel cron paths are protected by `CRON_SECRET`.
- Admin-only pages and API calls are guarded before launch.
- Player search and filters are backed by indexed columns.
- PostHog, Sentry, and Resend environment variables are configured.
