# PRD — ScoutFlow AI v2.0
**Product Requirements Document | Revised & Detailed**
**Data Provider: Sportmonks API v3 (Single Source)**

---

## Daftar Isi

1. [Product Overview](#1-product-overview)
2. [Background & Problem Statement](#2-background--problem-statement)
3. [Product Goals & OKR](#3-product-goals--okr)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [MVP Scope & Feature Matrix](#5-mvp-scope--feature-matrix)
6. [Tech Stack](#6-tech-stack)
7. [Sportmonks API v3 — Data Provider](#7-sportmonks-api-v3--data-provider)
8. [Application Structure & Routing](#8-application-structure--routing)
9. [Marketing Website](#9-marketing-website)
10. [Authentication & Onboarding](#10-authentication--onboarding)
11. [Dashboard Layout](#11-dashboard-layout)
12. [Overview Dashboard](#12-overview-dashboard)
13. [Player Database](#13-player-database)
14. [Player Detail Page](#14-player-detail-page)
15. [Club & Squad Intelligence](#15-club--squad-intelligence)
16. [AI Scouting Report System](#16-ai-scouting-report-system)
17. [Recruitment Recommendation Engine](#17-recruitment-recommendation-engine)
18. [Transfer Shortlist](#18-transfer-shortlist)
19. [Team Comparison](#19-team-comparison)
20. [Hidden Gem Discovery (Fitur Baru)](#20-hidden-gem-discovery-fitur-baru)
21. [Contract Intelligence & Alerts (Fitur Baru)](#21-contract-intelligence--alerts-fitur-baru)
22. [Player Watchlist & Monitoring (Fitur Baru)](#22-player-watchlist--monitoring-fitur-baru)
23. [Data Ingestion & Sync Architecture](#23-data-ingestion--sync-architecture)
24. [Admin Panel](#24-admin-panel)
25. [Subscription Plans](#25-subscription-plans)
26. [Database Schema](#26-database-schema)
27. [Supabase Storage](#27-supabase-storage)
28. [Reusable Components](#28-reusable-components)
29. [AI Prompt Templates](#29-ai-prompt-templates)
30. [API Routes](#30-api-routes)
31. [Security Requirements](#31-security-requirements)
32. [RLS Policy Requirements](#32-rls-policy-requirements)
33. [Analytics Tracking](#33-analytics-tracking)
34. [MVP Success Metrics](#34-mvp-success-metrics)
35. [Seed Data](#35-seed-data)
36. [Development Phases](#36-development-phases)
37. [Environment Variables](#37-environment-variables)
38. [Production Checklist](#38-production-checklist)
39. [Final MVP Definition](#39-final-mvp-definition)
40. [Codex Master Prompt](#40-codex-master-prompt)

---

## 1. Product Overview

### Product Name
**ScoutFlow AI**

### Version
2.0 — MVP with Sportmonks API v3

### Product Type
B2B SaaS platform untuk **football scouting, recruitment intelligence, squad analysis, dan player discovery**.

### One-liner
> *ScoutFlow AI membantu klub sepakbola tier bawah di Eropa menemukan pemain undervalued, menganalisis kelemahan skuad, dan membuat keputusan transfer lebih cepat menggunakan data real Sportmonks + AI.*

### Target Market

Klub sepakbola tier bawah dan semi-professional di Eropa:

| Liga | Negara |
|------|--------|
| EFL Championship, League One, League Two, National League | England |
| Bundesliga 2, 3. Liga | Germany |
| Serie B, Serie C | Italy |
| Ligue 2, Championnat National | France |
| Segunda División | Spain |
| Eerste Divisie | Netherlands |
| Scottish Championship, Scottish League One | Scotland |

Juga mencakup: **klub akademi** dan **recruitment agency** independen.

### Core Vision
Menjadi **AI Sporting Director Assistant** — platform yang memberikan intelligence level klub Premier League kepada klub yang tidak memiliki budget besar, dengan harga terjangkau dan setup minimal.

---

## 2. Background & Problem Statement

### 2.1 Pain Points Primer

| # | Pain Point | Detail |
|---|-----------|--------|
| 1 | **Budget scouting terbatas** | Tidak mampu subscribe tools seperti Wyscout (€500+/bulan) atau Hudl Statsbomb. |
| 2 | **Data tersebar** | Scouting notes di spreadsheet, video di Google Drive, stats dari website berbeda. |
| 3 | **Recruitment risk tinggi** | Salah rekrut pemain = degradasi + kerugian finansial langsung. |
| 4 | **Hidden gem sulit ditemukan** | Pemain bagus di liga bawah sering tidak terdeteksi sebelum diambil kompetitor. |
| 5 | **Workflow manual** | Scout masih mengirim PDF, WhatsApp, dan spreadsheet untuk laporan. |
| 6 | **Tidak ada squad depth analysis** | Klub tidak punya tool untuk melihat kelemahan posisi secara cepat. |
| 7 | **Transfer window panic** | Keputusan rekrutmen sering dibuat terburu-buru tanpa data yang cukup. |

### 2.2 Opportunity

Sportmonks v3 menyediakan data sepakbola Eropa yang sangat lengkap — termasuk statistics detail pemain, transfer history, squad data, dan fixture — dengan harga yang lebih terjangkau dibandingkan enterprise provider. Dengan mengkombinasikan ini dengan AI (OpenAI), ScoutFlow AI dapat memberikan insight kelas enterprise untuk klub kelas menengah.

---

## 3. Product Goals & OKR

### 3.1 Primary Goals

- Membantu klub menemukan pemain yang cocok dengan kebutuhan taktik dan budget.
- Membantu analyst membaca kelemahan skuad secara cepat.
- Membantu scout membuat AI scouting report otomatis.
- Membuat shortlist transfer yang rapi dan kolaboratif.
- Menjadi database internal untuk player recruitment.

### 3.2 Business Goals (OKR MVP)

| Objective | Key Result | Target |
|-----------|------------|--------|
| Validasi produk | Waitlist signups | 50+ |
| Validasi produk | Pilot users aktif | 5+ |
| Validasi produk | Paid pilot conversion | 1+ |
| Kualitas data | Player profiles via Sportmonks | 500+ |
| Kualitas AI | AI reports generated | 50+ |
| Engagement | Avg session duration | > 8 menit |

### 3.3 Technical Goals

| Metric | Target |
|--------|--------|
| Sportmonks sync success rate | > 98% |
| AI report generation time | < 15 detik |
| Player search response time | < 800ms |
| Dashboard first load | < 2.5 detik |
| Core Web Vitals LCP | < 2.5 detik |

---

## 4. User Roles & Permissions

### 4.1 Role Matrix

| Permission | Scout | Analyst | Club Admin | Platform Admin |
|------------|-------|---------|------------|----------------|
| Search player database | ✅ | ✅ | ✅ | ✅ |
| View player profile | ✅ | ✅ | ✅ | ✅ |
| Generate AI scouting report | ✅ | ✅ | ✅ | ✅ |
| Add player to shortlist | ✅ | ✅ | ✅ | ✅ |
| Add notes & rating | ✅ | ✅ | ✅ | ✅ |
| Compare players | ✅ | ✅ | ✅ | ✅ |
| Access squad analysis | ❌ | ✅ | ✅ | ✅ |
| View team comparison | ❌ | ✅ | ✅ | ✅ |
| Generate squad weakness report | ❌ | ✅ | ✅ | ✅ |
| Export report PDF | ❌ | ✅ | ✅ | ✅ |
| Manage club profile | ❌ | ❌ | ✅ | ✅ |
| Manage recruitment priorities | ❌ | ❌ | ✅ | ✅ |
| View all shortlists (club) | ❌ | ❌ | ✅ | ✅ |
| Invite team members | ❌ | ❌ | ✅ | ✅ |
| Access subscription settings | ❌ | ❌ | ✅ | ✅ |
| Manage all users | ❌ | ❌ | ❌ | ✅ |
| Trigger data sync | ❌ | ❌ | ❌ | ✅ |
| Monitor API logs | ❌ | ❌ | ❌ | ✅ |
| Manage subscriptions | ❌ | ❌ | ❌ | ✅ |
| Access Contract Intelligence alerts | ❌ | ✅ | ✅ | ✅ |
| Access Hidden Gem score | ✅ | ✅ | ✅ | ✅ |
| Manage Watchlist | ✅ | ✅ | ✅ | ✅ |

### 4.2 Detail Per Role

#### Scout
Tugas utama: mencari, menilai, dan melaporan pemain potensial.
- Akses penuh ke player database, filter, dan search.
- Bisa generate AI scouting report (terbatas per plan).
- Bisa manage shortlist dan watchlist pribadi.
- Tidak bisa akses squad analysis tingkat lanjut.

#### Recruitment Analyst
Tugas utama: membaca data, membuat rekomendasi strategis.
- Akses squad analysis dan team comparison.
- Bisa generate squad weakness report.
- Bisa export report ke PDF.
- Akses Contract Intelligence untuk monitoring pemain expiring contract.

#### Sporting Director / Club Admin
User utama di level klub, decision maker.
- Manage semua aspek club profile dan squad.
- Lihat semua shortlist dari seluruh anggota tim.
- Manage recruitment priorities dan transfer window budget.
- Invite dan manage team members.
- Akses penuh ke semua fitur analytical.

#### Platform Admin
Internal ScoutFlow AI operator.
- Full access ke semua data.
- Trigger Sportmonks sync manual dan jadwal.
- Monitor API health, error logs, dan usage.
- Manage subscriptions dan billing.

---

## 5. MVP Scope & Feature Matrix

### 5.1 MVP Must Have

| # | Fitur | Status |
|---|-------|--------|
| 1 | Marketing website (landing page premium) | Must Have |
| 2 | Supabase Auth (login, register, forgot password) | Must Have |
| 3 | Role-based dashboard | Must Have |
| 4 | Sportmonks v3 data sync (players, clubs, leagues, fixtures) | Must Have |
| 5 | Player database dengan filter lengkap | Must Have |
| 6 | Player detail page | Must Have |
| 7 | AI scouting report (OpenAI) | Must Have |
| 8 | Squad intelligence & weakness analysis | Must Have |
| 9 | Transfer shortlist (Kanban) | Must Have |
| 10 | Hidden Gem Discovery score | Must Have |
| 11 | Contract Intelligence alerts | Must Have |
| 12 | Player Watchlist & monitoring | Must Have |
| 13 | Team comparison | Must Have |
| 14 | Admin panel (users, sync, reports) | Must Have |
| 15 | Dark mode premium UI | Must Have |
| 16 | Responsive design (mobile, tablet, desktop) | Must Have |
| 17 | Subscription plan enforcement | Must Have |
| 18 | PDF export scouting report (placeholder) | Must Have |

### 5.2 Nice to Have (Post-MVP)

| Fitur | Estimasi Phase |
|-------|---------------|
| Email notifications (contract alerts, new report) | Phase 6 |
| Slack/Webhook integration | Phase 6 |
| CSV import squad data custom | Phase 6 |
| Player comparison side-by-side (3 pemain) | Phase 6 |
| Formation visualizer | Phase 7 |
| Transfer market value trend chart | Phase 7 |
| Video scouting link management | Phase 7 |
| Multi-language (EN + DE + FR) | Phase 8 |

### 5.3 Explicitly Not Included in MVP

- YOLO player tracking / AI video tracking
- Live tactical camera analysis
- Betting / fantasy system
- Realtime live score engine
- Complex multi-camera analytics
- Production payment gateway (hanya UI placeholder)
- Custom AI model fine-tuning
- Public API untuk third-party integrasi

---

## 6. Tech Stack

### 6.1 Frontend

| Technology | Purpose |
|------------|---------|
| Next.js 15 (App Router) | Framework utama |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| shadcn/ui | Component library |
| Magic UI | Animated components (landing page) |
| Framer Motion | Page & component animations |
| Recharts | Charts & data visualization |
| TanStack Table v8 | Player database table |
| TanStack Query v5 | Server state management |
| Zustand | Client state management |
| Lucide React | Icons |
| React Hook Form + Zod | Form handling & validation |
| next-themes | Dark/light mode |

### 6.2 Backend

| Technology | Purpose |
|------------|---------|
| Supabase Auth | Authentication & session |
| Supabase PostgreSQL | Primary database |
| Supabase Storage | File & image storage |
| Supabase Edge Functions | Serverless functions (sync worker) |
| Next.js API Routes | API layer |
| Next.js Server Actions | Mutasi data langsung |
| Zod | Input validation |
| node-cron | Scheduled sync jobs |

### 6.3 AI Layer

| Technology | Purpose |
|------------|---------|
| OpenAI GPT-4o | AI report & analysis generation |
| OpenAI Structured Outputs | JSON output dari AI |
| Tiktoken | Token counting untuk cost control |
| Vercel AI SDK | Streaming responses |

### 6.4 Data Provider

**Single Provider: Sportmonks Football API v3**
- Base URL: `https://api.sportmonks.com/api/v3/football`
- Auth: Bearer token (API key di header)
- Docs: https://docs.sportmonks.com/v3

### 6.5 Infrastructure & Deployment

| Technology | Purpose |
|------------|---------|
| Vercel | Frontend & API hosting |
| Supabase Cloud | Database, Auth, Storage |
| Vercel Cron Jobs | Penjadwalan sync harian |
| Sentry | Error monitoring |
| PostHog | Product analytics |
| Resend | Email transaksional |

---

## 7. Sportmonks API v3 — Data Provider

### 7.1 Overview

Sportmonks v3 adalah REST API football data dengan coverage liga Eropa yang sangat baik. Semua data di ScoutFlow AI bersumber dari provider ini.

**Authentication:**
```
Authorization: Bearer {SPORTMONKS_API_TOKEN}
```

**Base URL:**
```
https://api.sportmonks.com/api/v3/football
```

**Fitur utama API:**
- `include` parameter untuk relasi (mengurangi jumlah request)
- Pagination dengan `per_page` dan `page`
- Filter via query params
- Rate limit: tergantung plan (min 3000 req/jam di starter)

### 7.2 Endpoint Mapping ke Fitur ScoutFlow

#### Leagues & Seasons
```
GET /leagues
GET /leagues/{leagueId}
GET /leagues/{leagueId}/seasons
GET /seasons
GET /seasons/{seasonId}
```

**Digunakan untuk:** dropdown filter liga, data season aktif.

#### Teams (Clubs)
```
GET /teams
GET /teams/{teamId}
GET /teams/search/{query}
GET /teams/countries/{countryId}
GET /squads/teams/{teamId}                       → squad aktif klub
GET /squads/seasons/{seasonId}/teams/{teamId}    → squad per season
```

**Include yang berguna:**
```
?include=country;league;activeseason;statistics.season
```

#### Players
```
GET /players
GET /players/{playerId}
GET /players/search/{query}
GET /players/countries/{countryId}
GET /players/latest                              → pemain yang baru diupdate
```

**Include yang berguna:**
```
?include=position;nationality;teams.team;statistics.details;transfers
```

#### Player Statistics (Per Season)
```
GET /statistics/seasons/players/{seasonId}      → semua stats pemain di season
GET /players/{playerId}?include=statistics.details.type
```

**Statistics detail types yang relevan (via `type_id`):**

| type_id | Stat |
|---------|------|
| 52 | Appearances |
| 56 | Minutes Played |
| 42 | Goals |
| 65 | Assists |
| 84 | Yellow Cards |
| 83 | Red Cards |
| 129 | Rating (average) |
| 117 | Passes |
| 99 | Tackles |
| 101 | Interceptions |
| 78 | Shots on Target |
| 97 | Duels Won |

#### Fixtures
```
GET /fixtures
GET /fixtures/{fixtureId}
GET /fixtures/date/{date}
GET /fixtures/between/{startDate}/{endDate}
GET /fixtures/between/{startDate}/{endDate}/teams/{teamId}
```

**Include yang berguna:**
```
?include=participants;scores;state;league;round
```

#### Standings
```
GET /standings/seasons/{seasonId}
GET /standings/rounds/{roundId}
GET /standings/live
```

#### Transfers
```
GET /transfers
GET /transfers/teams/{teamId}
GET /transfers/players/{playerId}
GET /transfers/between/{startDate}/{endDate}
GET /transfers/latest
```

**Include yang berguna:**
```
?include=player;fromTeam;toTeam;type
```

#### Coaches
```
GET /coaches/{coachId}
GET /coaches/teams/{teamId}
```

#### Countries & Positions
```
GET /countries
GET /positions
GET /types                                       → jenis statistik
```

### 7.3 Data Normalization Strategy

Data dari Sportmonks disimpan ke format ScoutFlow setelah normalisasi:

```
Sportmonks Response
        ↓
  Normalization Layer (lib/providers/sportmonks/normalize.ts)
        ↓
  Supabase PostgreSQL (tabel canonical)
        ↓
  AI Layer + Frontend
```

**Field mapping contoh (Player):**

| Sportmonks Field | ScoutFlow DB Field |
|-----------------|-------------------|
| `player.id` | `players.sportmonks_id` |
| `player.common_name` | `players.display_name` |
| `player.firstname` + `lastname` | `players.name` |
| `player.date_of_birth` | `players.date_of_birth` |
| `player.position_id` | `players.primary_position` (join positions) |
| `player.nationality_id` | `players.nationality` (join countries) |
| `player.height` | `players.height` |
| `player.weight` | `players.weight` |
| `player.image_path` | `players.image_url` |

### 7.4 Rate Limiting & Caching Strategy

```
Request Flow:
Client → Cache Check (Supabase) → Sportmonks API (if stale)

Cache TTL:
- Player profile: 24 jam
- Player stats: 6 jam
- Fixture results: 2 jam
- Standings: 6 jam
- Transfers: 12 jam
- League/team list: 7 hari
```

**Rate limit handling:**
- Exponential backoff pada 429 response
- Queue-based sync untuk bulk operations
- Respect `X-RateLimit-Remaining` header

---

## 8. Application Structure & Routing

### 8.1 Route Structure

```
/(marketing)
  /                         → Landing page
  /pricing                  → Halaman harga
  /features                 → Detail fitur
  /about                    → Tentang produk
  /blog                     → Blog (placeholder)
  /contact                  → Kontak

/(auth)
  /login                    → Login page
  /register                 → Register page
  /forgot-password          → Reset password
  /reset-password           → Reset form (dari email link)
  /onboarding               → Club setup wizard (setelah register)

/dashboard
  /                         → Overview (redirect by role)
  /scout                    → Scout-specific overview
  /club                     → Club Admin overview
  /admin                    → Platform Admin overview

/players
  /                         → Player database table
  /[id]                     → Player detail page
  /compare                  → Perbandingan 2 pemain

/clubs
  /                         → Club database
  /[id]                     → Club profile + squad
  /[id]/analysis            → Squad weakness analysis

/shortlist
  /                         → Shortlist board (Kanban)
  /[id]                     → Specific shortlist

/reports
  /                         → Semua AI reports
  /[id]                     → Report detail + export

/watchlist
  /                         → Player monitoring & alerts

/hidden-gems
  /                         → Hidden Gem Discovery engine

/contracts
  /                         → Contract Intelligence dashboard

/compare
  /teams                    → Team comparison

/admin
  /                         → Admin overview
  /users                    → User management
  /clubs                    → Club management
  /players                  → Player management
  /sync                     → Data sync dashboard
  /reports                  → AI report logs
  /subscriptions            → Subscription management
```

### 8.2 Folder Structure

```
src/
  app/
    (marketing)/
      page.tsx
      pricing/page.tsx
      features/page.tsx
      about/page.tsx
      contact/page.tsx
    (auth)/
      login/page.tsx
      register/page.tsx
      forgot-password/page.tsx
      reset-password/page.tsx
      onboarding/
        page.tsx                  → Club setup wizard
        _steps/
          ClubSetupStep.tsx
          RecruitmentPriorityStep.tsx
          InviteTeamStep.tsx
    dashboard/
      page.tsx
      scout/page.tsx
      club/page.tsx
      admin/page.tsx
    players/
      page.tsx
      [id]/page.tsx
      compare/page.tsx
    clubs/
      page.tsx
      [id]/
        page.tsx
        analysis/page.tsx
    shortlist/
      page.tsx
      [id]/page.tsx
    reports/
      page.tsx
      [id]/page.tsx
    watchlist/page.tsx
    hidden-gems/page.tsx
    contracts/page.tsx
    compare/
      teams/page.tsx
    admin/
      page.tsx
      users/page.tsx
      clubs/page.tsx
      players/page.tsx
      sync/page.tsx
      reports/page.tsx
      subscriptions/page.tsx
    api/
      ai/
        scouting-report/route.ts
        squad-analysis/route.ts
        recruitment-recommendation/route.ts
        hidden-gem-score/route.ts
        tactical-fit/route.ts
      players/
        route.ts
        [id]/route.ts
        import/route.ts
      clubs/
        route.ts
        [id]/route.ts
        [id]/squad/route.ts
        [id]/analysis/route.ts
      sync/
        leagues/route.ts
        teams/route.ts
        players/route.ts
        fixtures/route.ts
        standings/route.ts
        transfers/route.ts
        logs/route.ts
      shortlists/
        route.ts
        [id]/route.ts
        [id]/players/route.ts
        [id]/players/[playerId]/route.ts
      reports/
        route.ts
        [id]/route.ts
        [id]/export/route.ts
      watchlist/
        route.ts
        [id]/route.ts
      contracts/
        alerts/route.ts
      webhooks/
        sportmonks/route.ts

  components/
    marketing/
      Navbar.tsx
      HeroSection.tsx
      ProblemSection.tsx
      FeaturesSection.tsx
      HowItWorksSection.tsx
      DashboardShowcase.tsx
      PricingSection.tsx
      TestimonialsSection.tsx
      FAQSection.tsx
      Footer.tsx
      AnimatedStatCard.tsx
    dashboard/
      Sidebar.tsx
      DashboardHeader.tsx
      MobileNav.tsx
      StatCard.tsx
      AnalyticsChart.tsx
      RecentActivity.tsx
      NotificationPanel.tsx
      RoleGuard.tsx
    players/
      PlayerTable.tsx
      PlayerFilters.tsx
      PlayerCard.tsx
      PlayerHeader.tsx
      PlayerStatsGrid.tsx
      PlayerRadarChart.tsx
      PlayerPerformanceTrend.tsx
      PlayerCompareTool.tsx
      TransferHistory.tsx
      HiddenGemBadge.tsx
    clubs/
      ClubCard.tsx
      ClubProfile.tsx
      SquadList.tsx
      PositionalDepthChart.tsx
      AgeProfileChart.tsx
      SquadWeaknessReport.tsx
    reports/
      AIReportCard.tsx
      AIReportViewer.tsx
      ReportExportButton.tsx
    shortlist/
      ShortlistBoard.tsx
      ShortlistPlayerCard.tsx
      ShortlistForm.tsx
      ShortlistExport.tsx
    watchlist/
      WatchlistTable.tsx
      WatchlistAlertBadge.tsx
    contracts/
      ContractAlertTable.tsx
      ExpiryCountdown.tsx
    ui/
      DataTable.tsx
      SearchBar.tsx
      EmptyState.tsx
      LoadingState.tsx
      LoadingSkeleton.tsx
      RadarChart.tsx
      ScoreBadge.tsx
      RiskBadge.tsx
      PlanLimitWarning.tsx
      PositionBadge.tsx
      NationalityFlag.tsx

  lib/
    supabase/
      client.ts               → Browser client
      server.ts               → Server client
      admin.ts                → Service role client
      middleware.ts
    ai/
      openai.ts               → OpenAI client
      prompts/
        scoutingReport.ts
        squadWeakness.ts
        recruitmentRec.ts
        hiddenGemScore.ts
        tacticalFit.ts
      parsers/
        reportParser.ts
        scoreParser.ts
    providers/
      sportmonks/
        client.ts             → HTTP client + auth
        endpoints.ts          → Semua endpoint definitions
        normalize/
          players.ts
          teams.ts
          fixtures.ts
          standings.ts
          transfers.ts
          statistics.ts
        sync/
          leagues.ts
          teams.ts
          players.ts
          fixtures.ts
          standings.ts
          transfers.ts
        rateLimit.ts          → Rate limiter
        cache.ts              → Cache TTL logic
    utils/
      hiddenGemScore.ts       → Algoritma scoring
      contractStatus.ts       → Contract expiry logic
      fitScore.ts             → Tactical fit calculation
      formatters.ts           → Date, number, text formatters
      pagination.ts

  types/
    supabase.ts               → Database types (generated)
    sportmonks.ts             → Sportmonks API types
    ai.ts                     → AI report types
    filters.ts                → Filter types
    index.ts

  hooks/
    usePlayers.ts
    useClub.ts
    useShortlist.ts
    useWatchlist.ts
    useContractAlerts.ts
    useAIReport.ts
    useSyncStatus.ts
    useSubscription.ts

  stores/
    playerFilterStore.ts      → Zustand: filter state
    shortlistStore.ts         → Zustand: shortlist UI
    uiStore.ts                → Zustand: sidebar, modal state

  styles/
    globals.css
```

---

## 9. Marketing Website

### 9.1 Design Direction

- **Dark mode first** dengan toggle light
- Animated gradient background (deep navy + electric green accent)
- Glassmorphism cards untuk fitur section
- Smooth scroll dengan Framer Motion
- Subtle particle/grid effect di hero
- Dashboard UI mockup animasi
- Premium B2B SaaS feel (referensi: Linear, Vercel, Perplexity)
- Mobile responsive sepenuhnya

### 9.2 Sections

#### Section 1 — Hero
```
Headline:   "AI Recruitment Intelligence for Lower-Tier Football Clubs"
Subheadline: "Discover undervalued players, analyze squad weaknesses,
              and build smarter transfer shortlists — powered by
              Sportmonks data and AI."

CTA Primary:    "Start Free Trial"     → /register
CTA Secondary:  "View Live Demo"       → video/demo modal

Animated floating stat cards:
  - "147 AI Reports Generated"
  - "Hidden Gem Score: 91/100"
  - "Squad Weakness Detected: RB Depth"
  - "Transfer Fit Score: 87%"

Background: animated football field grid, subtle motion
```

#### Section 2 — Social Proof Bar
```
Trusted by scouts and clubs in:
[EFL Logo] [Bundesliga 2 Logo] [Serie B Logo] [Ligue 2 Logo] [...]
```

#### Section 3 — Problem Section
```
Cards:
- "Spreadsheet scouting wastes 40% of your time"
- "Missing hidden gems to better-resourced rivals"
- "Recruitment mistakes cost promotions"
- "No unified squad analysis tool"
```

#### Section 4 — Features Section (6 Cards)

| Feature | Icon | Deskripsi |
|---------|------|-----------|
| AI Scouting Reports | 🤖 | Generate laporan profesional dalam detik |
| Squad Weakness Analysis | 📊 | Deteksi posisi lemah skuad secara otomatis |
| Hidden Gem Discovery | 💎 | Temukan pemain undervalued sebelum kompetitor |
| Transfer Shortlist | 📋 | Kelola target transfer dengan Kanban workflow |
| Contract Intelligence | ⏰ | Alert pemain dengan kontrak mau habis |
| Tactical Fit Score | 🎯 | Skor kompatibilitas taktik pemain dengan klub |

#### Section 5 — How It Works (5 Steps)
1. **Connect** — Kami sync data dari Sportmonks secara otomatis
2. **Explore** — Search database pemain dengan filter canggih
3. **Analyze** — Generate AI scouting report dalam detik
4. **Shortlist** — Kelola target di Kanban board kolaboratif
5. **Decide** — Buat keputusan transfer berdasarkan data, bukan insting

#### Section 6 — Product Showcase
Animated mockup tabs:
- Player Database (table view)
- AI Scouting Report (report card)
- Squad Analysis (weakness radar chart)
- Transfer Shortlist (Kanban board)
- Hidden Gem Discovery (scored list)

#### Section 7 — Pricing
(Lihat Section 25)

#### Section 8 — Testimonials (Placeholder)
```
"ScoutFlow halved our scouting time. We found our main striker
 for next season in the first week." — Head of Recruitment, EFL Club

"The AI reports are frighteningly accurate. It's like having
 a full analyst team at a fraction of the cost." — Chief Scout

"Finally a tool built for clubs like ours. Clean, fast, affordable."
— Sporting Director, League Two Club
```

#### Section 9 — FAQ
| Pertanyaan | Jawaban |
|-----------|---------|
| Untuk klub level apa? | Klub semipro hingga second-tier, termasuk akademi dan agency. |
| Liga apa yang didukung? | Liga yang tersedia di Sportmonks v3 — termasuk EFL, Bundesliga 2, Serie B, Ligue 2, dll. |
| Apakah menggantikan scout? | Tidak — ScoutFlow mempercepat kerja scout, bukan menggantikan. |
| Bisakah import data sendiri? | Post-MVP, tersedia CSV import. |
| Berapa biaya langganan? | Mulai dari paket Scout Pro (detail di pricing). |
| Data seberapa sering diupdate? | Stats diupdate harian, fixture tiap 2 jam. |
| Apakah ada free trial? | Ya, 14 hari trial dengan fitur lengkap. |

#### Section 10 — Footer
```
Product:  Features | Pricing | Demo | Changelog
Company:  About | Blog | Contact | Careers
Legal:    Privacy Policy | Terms of Service | Cookie Policy
Social:   Twitter/X | LinkedIn
```

---

## 10. Authentication & Onboarding

### 10.1 Auth Pages

**Login** (`/login`)
- Email + Password
- "Remember me"
- Link ke Register & Forgot Password
- Error handling: invalid credentials, email not verified

**Register** (`/register`)
- Full Name
- Work Email
- Password + Confirm Password
- Organization Name
- Role: Scout / Analyst / Club Admin
- Agree to Terms checkbox
- Post-register: email verification + redirect ke `/onboarding`

**Forgot Password** (`/forgot-password`)
- Input email
- Kirim reset link via Supabase Auth + Resend

**Reset Password** (`/reset-password?token=...`)
- New password + confirm
- Auto-login setelah sukses

### 10.2 Onboarding Wizard (3 Steps)

Setelah register, Club Admin wajib melalui onboarding. Scout dan Analyst bisa skip.

**Step 1 — Club Setup**
- Nama klub (search dari Sportmonks atau manual)
- Liga
- Negara
- Transfer budget range (estimasi, untuk context AI)
- Tactical formation preference

**Step 2 — Recruitment Priorities**
- Posisi yang sedang dicari (multi-select)
- Umur ideal pemain
- Prefer: Free agent / Under contract
- Risk tolerance: Low / Medium / High

**Step 3 — Invite Team**
- Input email anggota tim (Scout/Analyst)
- Set role
- Kirim invite email

### 10.3 Session & Middleware

```typescript
// middleware.ts
// Protected routes: /dashboard, /players, /clubs, /shortlist, /reports,
//                  /watchlist, /hidden-gems, /contracts, /compare, /admin
// Admin-only: /admin/*
// Public: /(marketing), /(auth)
```

---

## 11. Dashboard Layout

### 11.1 Sidebar Navigation

```
[Logo ScoutFlow AI]

MAIN
  ▸ Overview                       /dashboard
  ▸ Player Database                /players
  ▸ Hidden Gem Discovery  🔥NEW    /hidden-gems
  ▸ Club Intelligence              /clubs
  ▸ AI Reports                     /reports

RECRUITMENT
  ▸ Transfer Shortlist             /shortlist
  ▸ Player Watchlist               /watchlist
  ▸ Contract Intelligence  🔥NEW   /contracts

ANALYSIS
  ▸ Team Comparison                /compare/teams

SYSTEM
  ▸ Data Sync Status               /admin/sync  (admin only)
  ▸ Settings                       /settings
  ▸ Subscription                   /settings/subscription
  ▸ Admin Panel          👑        /admin  (admin only)

[User Avatar]
[Plan Badge: Free / Pro / Club]
[Logout]
```

### 11.2 Dashboard Header

```
[Mobile menu toggle]  [Search bar: "Search players, clubs..."]  [Sync status indicator]  [🔔 Notif]  [Club Selector ▼]  [User Menu ▼]
```

**Club Selector** (untuk Club Admin yang manage multi-klub):
- Dropdown dengan daftar klub yang dikelola
- Context berubah ketika ganti klub

**Notification Center:**
- Contract alerts (pemain expiring)
- Sync completion
- New AI reports
- Invite accepted

---

## 12. Overview Dashboard

### 12.1 Stat Cards (Row 1)

| Card | Data | Sumber |
|------|------|--------|
| Total Players (synced) | Jumlah pemain di DB | Supabase count |
| Players in Watchlist | Jumlah pemain dimonitor | watchlist table |
| Shortlisted This Month | Penambahan bulan ini | shortlist_players |
| AI Reports Generated | Total report bulan ini | ai_scouting_reports |
| Contract Expiry Alerts | Pemain kontrak < 6 bulan | players.contract_until |
| Last Sync | Waktu sync terakhir | data_sync_logs |

### 12.2 Charts

**Chart 1 — Player Position Distribution (Pie/Donut)**
Data: pemain tersimpan di DB per posisi

**Chart 2 — Shortlist Activity (Bar Chart per minggu)**
Data: penambahan player ke shortlist 4 minggu terakhir

**Chart 3 — AI Report Usage (Line Chart)**
Data: report yang dihasilkan per hari (30 hari)

**Chart 4 — Squad Age Profile (Histogram)**
Data: distribusi umur pemain di squad aktif klub user

**Chart 5 — Top 5 Leagues by Player Count (Bar)**
Data: liga dengan pemain terbanyak di database

### 12.3 Recent Activity Feed
```
[Avatar] Scout Andi menambahkan Marcus Cole ke Priority Shortlist  — 2 menit lalu
[Avatar] AI Report untuk Daniel Torres selesai dibuat             — 15 menit lalu
[Avatar] Squad analysis EFL Championship – Barnsley diperbarui    — 1 jam lalu
[Avatar] Sportmonks sync: 2,450 player stats diperbarui           — 3 jam lalu
[Avatar] ⚠️ 3 pemain kontrak habis dalam 60 hari terdeteksi       — 6 jam lalu
```

### 12.4 Quick Actions Panel
```
[🔍 Search Player]  [➕ Add to Shortlist]  [🤖 Generate Report]  [📊 Analyze Squad]
```

---

## 13. Player Database

### 13.1 Player Table

Kolom default (dapat dikustomisasi):

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| # | Number | Row number |
| Player | Avatar + Name + Flag | Display name + nationality |
| Age | Number | Umur saat ini |
| Position | Badge | Primary position |
| Club | Club logo + Name | Klub saat ini |
| League | Text | Liga aktif |
| Appearances | Number | Season ini |
| Goals | Number | Season ini |
| Assists | Number | Season ini |
| Rating | Number (0-10) | Average rating |
| Hidden Gem Score | Score badge (0-100) | Algoritma ScoutFlow |
| Contract Until | Date | Tanggal ekspirasi |
| Actions | Buttons | View, Report, Add to shortlist |

### 13.2 Filter Panel (Sidebar kiri)

```
BASIC FILTERS
  ▸ Search (nama/klub)
  ▸ Position (multi-select): GK, CB, LB, RB, DM, CM, AM, LW, RW, ST
  ▸ League (multi-select): dropdown dari Sportmonks
  ▸ Country/Nationality (multi-select)
  ▸ Age Range: slider (15–40)
  ▸ Preferred Foot: Any / Left / Right

PERFORMANCE FILTERS
  ▸ Min Appearances
  ▸ Min Goals
  ▸ Min Assists
  ▸ Min Rating
  ▸ Season: dropdown

CONTRACT FILTERS
  ▸ Contract Status: Any / Active / Expiring (< 6 months) / Free Agent
  ▸ Contract Expiry Before: date picker

ADVANCED (Plan-gated)
  ▸ Hidden Gem Score Range: slider
  ▸ Tactical Fit Score: slider
  ▸ Market Value Range (estimasi)
  ▸ Transfer Status: Any / Available / Not Available
```

### 13.3 Actions per Player Row

- **View Profile** → /players/[id]
- **Generate AI Report** → modal konfirmasi → generate report
- **Add to Shortlist** → modal pilih shortlist + status
- **Add to Watchlist** → langsung tambah ke watchlist
- **Compare** → tambah ke compare buffer (max 2 pemain)

### 13.4 Bulk Actions (Checkbox)

- Add selected to Shortlist
- Add selected to Watchlist
- Export selected to CSV

---

## 14. Player Detail Page

### 14.1 Player Header
```
[Foto Pemain (Sportmonks image_path)]
Nama Lengkap                    [Add to Shortlist ▼]
Age: 24  |  Nationality: 🇧🇷  |  DOB: 12 Mar 2000  [Add to Watchlist]
Position: CM (Secondary: DM)                         [Generate AI Report]
Club: [Logo] Barnsley FC  |  League: EFL Championship
Contract Until: 30 Jun 2025  ⚠️ (6 bulan lagi)
Height: 181cm  |  Weight: 77kg  |  Preferred Foot: Right
Hidden Gem Score: [92] 🔥
```

### 14.2 Performance Overview (Season Stats)

Grid stat cards dari Sportmonks statistics:

| Stat | Value |
|------|-------|
| Appearances | 28 |
| Minutes Played | 2,340 |
| Goals | 7 |
| Assists | 11 |
| Yellow Cards | 4 |
| Red Cards | 0 |
| Avg Rating | 7.4 |
| Pass Accuracy | 87% |
| Tackles | 62 |
| Interceptions | 34 |

### 14.3 Visualizations

**Radar Chart** (6 dimensi disesuaikan posisi):
- CM: Passing, Dribbling, Defensive, Attacking, Physical, Consistency
- ST: Shooting, Dribbling, Physical, Positioning, Speed, Assist
- GK: Reflexes, Positioning, Aerial, Distribution, Communication, Sweeping

**Performance Trend (Line Chart)**:
- Rating per match 10 game terakhir (dari fixture statistics)

**Goal/Assist Timeline (Bar Chart)**:
- Per bulan dalam season ini

**Positional Heatmap (placeholder UI)**:
- Area bermain di lapangan (placeholder, data tidak tersedia dari Sportmonks basic plan)

### 14.4 AI Scouting Report Panel

Bila belum ada report:
```
[Generate AI Scouting Report button]
Menggunakan AI untuk menganalisis stats & profil pemain ini.
```

Bila report sudah ada (tampilkan yang terbaru):
```
📋 AI Scouting Report — Generated 2 Jan 2025

Executive Summary:
[paragraph AI]

Strengths: [list]
Weaknesses: [list]
Tactical Fit: [assessment]
Risk Level: [Low/Medium/High badge]
Recommendation Score: [82/100]
Best Role: [Ball-Progressing 8]
Final Recommendation: [Sign / Monitor / Avoid]

[Regenerate] [Export PDF] [View Full Report]
```

### 14.5 Transfer Intelligence

Data dari Sportmonks `/transfers/players/{playerId}`:

```
Transfer History:
  2023 | Barnsley FC ← Rotherham United | Permanent | £180K
  2021 | Rotherham United ← Sheffield United (loan) | Loan
  2020 | Sheffield United ← Academy | —

Contract Intelligence:
  Expires: 30 June 2025 (6 bulan 12 hari)
  Status: ⚠️ Expiring Soon
  Availability Signal: Mungkin tersedia sebagai free agent Juli 2025
  Recruitment Risk: Medium
```

### 14.6 Similar Player Profiles (AI-generated)

```
Pemain dengan profil serupa yang bisa dijadikan alternatif:
[Card] [Card] [Card]
```

### 14.7 Scout Notes Section

```
[Tambah Catatan Scout]
Tanggal | Penulis | Catatan
--------+---------+---------------------------
2 Jan   | Andi M  | Performa bagus vs Swansea
5 Dec   | Andi M  | Sedikit lambat di transisi
```

---

## 15. Club & Squad Intelligence

### 15.1 Club Profile Header

Data dari Sportmonks `/teams/{teamId}`:
```
[Logo Klub]
Nama Klub: Barnsley FC
Liga: EFL Championship | Negara: England
Season Aktif: 2024/2025
Formation Preferensi: 4-3-3
Transfer Budget (diinput manual): £1.5M
Recruitment Status: Active
```

### 15.2 Squad Overview

Data dari Sportmonks `/squads/teams/{teamId}` + include players + statistics:

**Squad Stats:**
- Total players: 24
- Avg age: 24.6
- Oldest: 34 | Youngest: 18
- Nationalities: 12

**Squad Table:**

| Pemain | Posisi | Umur | Nationality | Contract | Apps | Rating | Risk |
|--------|--------|------|-------------|----------|------|--------|------|
| James Green | GK | 28 | ENG | Jun 2026 | 31 | 7.1 | Low |
| ... | | | | | | | |

### 15.3 Positional Depth Chart

Visualisasi formasi dengan depth per posisi:

```
Formation: 4-3-3

GK:   [Green - 7.1] [Backup - 6.2]
RB:   [Walker - 6.8] [EMPTY ⚠️]
CB:   [Smith - 7.3] [Jones - 6.9]
CB:   [Brown - 7.0] [Williams - 6.4]
LB:   [Taylor - 7.2] [EMPTY ⚠️]
...
```

Kode warna:
- 🟢 Cukup depth (2+ pemain)
- 🟡 Minimal (1 pemain)
- 🔴 Kosong / tidak ada backup

### 15.4 Age Profile Chart

Histogram distribusi umur skuad. Highlight:
- Pemain dengan kontrak expiring di age bracket mana
- "Core" age group (pemain 23–28)

### 15.5 AI Squad Weakness Analysis

**Input ke AI:**
```
squad_data: [list pemain + posisi + stats + kontrak]
league_context: Liga, posisi di klasemen, target promosi
club_context: Budget, formation, style, recruitment priorities
```

**Output AI (Structured JSON):**
```json
{
  "squad_strengths": ["string"],
  "squad_weaknesses": ["string"],
  "positional_gaps": [{"position": "RB", "severity": "High", "reason": "..."}],
  "aging_risk": {"players": [...], "risk_level": "Medium"},
  "tactical_mismatch": "string",
  "recruitment_priorities": [
    {
      "rank": 1,
      "position": "Right Back",
      "urgency": "High",
      "profile": "Attack-minded, aged 20-26, technical...",
      "reasoning": "..."
    }
  ]
}
```

**Tampilan UI:**
- Summary card dengan warna severity
- Positional gap badges
- Collapsible sections per kategori
- Export ke PDF

### 15.6 Recent Fixtures (5 Pertandingan Terakhir)

Data dari Sportmonks `/fixtures/between/{start}/{end}/teams/{teamId}`:
```
EFL Championship Season 2024/25
W  Barnsley 2-1 Swansea City     3 Jan 2025
L  Bristol City 1-0 Barnsley     28 Dec 2024
D  Barnsley 1-1 Preston          22 Dec 2024
W  Barnsley 3-0 Stoke City       18 Dec 2024
L  Sheffield Wed 2-1 Barnsley    14 Dec 2024
```

### 15.7 League Standing Widget

```
#  | Club      | P  | W  | D  | L  | GF | GA | GD | Pts
14 | Barnsley  | 26 | 10 | 7  | 9  | 38 | 41 | -3 | 37
```

---

## 16. AI Scouting Report System

### 16.1 Report Types

| Tipe | Trigger | Deskripsi |
|------|---------|-----------|
| General Scouting | Default | Analisis komprehensif pemain |
| Position-Specific | Pilihan posisi | Fokus metrik posisi tertentu |
| Tactical Fit | + Club context | Analisis kesesuaian taktik klub |
| Replacement | + Player to replace | Cari profil serupa untuk gantikan pemain |
| Hidden Gem | Auto (dari score) | Laporan khusus untuk hidden gem |
| Promotion Push | + League context | Analisis nilai pemain untuk kejar promosi |

### 16.2 Report Generation Flow

```
User klik "Generate AI Report"
        ↓
Cek subscription limit (ai_report_used < ai_report_limit)
        ↓ (jika OK)
Ambil data pemain dari Supabase (player + stats + squad + club)
        ↓
Ambil konteks klub dari club profile user
        ↓
Kirim ke OpenAI GPT-4o dengan structured output
        ↓
Parse JSON response
        ↓
Simpan ke ai_scouting_reports
        ↓
Update ai_report_used di subscriptions
        ↓
Tampilkan report ke user (streaming)
```

### 16.3 Report Output Structure

```typescript
interface AIScoutingReport {
  executive_summary: string;
  strengths: string[];           // 3-5 poin
  weaknesses: string[];          // 2-4 poin
  tactical_fit: {
    assessment: string;
    formation_compatibility: string[];
    role_suggestions: string[];
  };
  risk_assessment: {
    level: "Low" | "Medium" | "High";
    factors: string[];
  };
  recommendation_score: number;  // 0-100
  best_role: string;
  similar_profiles: string[];    // Nama pemain serupa (dari AI knowledge)
  final_recommendation: "Sign" | "Monitor" | "Avoid";
  reasoning: string;
}
```

### 16.4 Token & Cost Control

- Estimasi token per report: ~1,500–2,500 tokens
- Model: GPT-4o (cost-efficient, fast)
- Caching: Report disimpan di DB, tidak di-regenerate kecuali diminta
- Rate limiting: max 3 concurrent AI requests per organization

---

## 17. Recruitment Recommendation Engine

### 17.1 User Input Form

```
Target Position:     [Dropdown]
Age Range:           [Slider: 16-38]
League Preference:   [Multi-select]
Tactical Style:      [Dropdown: Possession / Press / Counter / Direct]
Max Market Value:    [Input number]
Contract Preference: [Any / Expiring / Free Agent]
Risk Tolerance:      [Low / Medium / High]
Notes untuk AI:      [Textarea]
```

### 17.2 Backend Logic

1. Filter pemain dari DB sesuai kriteria (posisi, umur, liga, kontrak)
2. Urutkan berdasarkan Hidden Gem Score
3. Ambil top 20 candidate
4. Kirim ke AI untuk scoring & ranking final dengan justifikasi

### 17.3 Output

```
RANKED RECOMMENDATIONS

#1 — Marcus Rodriguez | CM | Barnsley FC
     Fit Score: 91/100  |  Risk: Low  |  Contract: Jun 2025 (expiring)
     "Strong press-resistant midfielder, perfect for your 4-3-3.
      Expiring contract = low cost opportunity."
     [View Profile] [Generate Full Report] [Add to Shortlist]

#2 — Daniel Park | CM | Rotherham United
     Fit Score: 84/100  |  Risk: Medium  |  Contract: Jun 2026
     "Good passer but slower pressing output. Budget-friendly option."
     [View Profile] [Generate Full Report] [Add to Shortlist]

...
```

---

## 18. Transfer Shortlist

### 18.1 Shortlist Board (Kanban)

5 kolom status:

| Kolom | Deskripsi |
|-------|-----------|
| 📋 Watchlist | Pemain yang diobservasi |
| 🔍 Scout Further | Perlu investigasi lebih lanjut |
| 🎯 Priority Target | Target utama transfer window |
| 🤝 Negotiation | Dalam proses negosiasi |
| ❌ Rejected | Tidak dilanjutkan |

### 18.2 Player Card di Kanban

```
[Foto] Marcus Rodriguez
       CM | Barnsley FC | Age 23
       🇧🇷  Contract: Jun 2025 ⚠️
       
Fit Score: [91]  Risk: [Low]
─────────────────────────
Scout Note: "Bagus vs Swansea"
Priority: 🔴 High
─────────────────────────
[Report] [Notes] [Move ▼] [···]
```

### 18.3 Shortlist Management

- **Multi-shortlist**: User bisa punya beberapa shortlist (Summer 2025, Winter 2025)
- **Sharing**: Club Admin bisa share shortlist ke semua member tim
- **Assign scout**: Assign pemain ke scout spesifik
- **Export**: Export shortlist ke CSV atau PDF

### 18.4 Shortlist Notes & Timeline

Per player di shortlist, ada log aktivitas:
```
3 Jan 2025   Andi M.     Ditambahkan ke Watchlist
5 Jan 2025   Budi S.     AI Report dibuat (Score: 88)
7 Jan 2025   Andi M.     Dipindahkan ke Priority Target
8 Jan 2025   Andi M.     Catatan: "Confirmed available di Jan window"
```

---

## 19. Team Comparison

### 19.1 Comparison View

Pilih 2 klub dari dropdown → tampilkan side-by-side:

| Metrik | Barnsley FC | Rotherham Utd |
|--------|-------------|---------------|
| League Position | 14 | 9 |
| Points | 37 | 44 |
| Goals For | 38 | 51 |
| Goals Against | 41 | 38 |
| Recent Form | WLDWL | WWDLW |
| Avg Squad Age | 24.6 | 26.1 |
| Squad Size | 24 | 22 |
| Depth Score | 72/100 | 81/100 |
| Attacking Output | 6.5/10 | 7.8/10 |
| Defensive Stability | 5.9/10 | 7.2/10 |

### 19.2 Comparison Charts

- **Radar Chart**: 6 dimensi tim (Attacking, Defensive, Physical, Pressing, Depth, Form)
- **Standing Timeline**: Posisi klasemen per pekan (line chart, 10 pekan terakhir)

### 19.3 AI Comparison Output

```
AI Team Comparison Analysis

Rotherham memiliki keunggulan signifikan dalam efisiensi attacking
(avg 1.96 goals/game vs 1.46 Barnsley). Namun Barnsley memiliki
squad yang lebih muda (avg 24.6 vs 26.1) dan potensi berkembang lebih besar.

Promotion Profile:
  Rotherham: 68% probability → 🟢 Stronger candidate
  Barnsley:  42% probability → 🟡 Needs reinforcement in attack

Recruitment Recommendation for Barnsley:
Fokus pada striker dengan pressing output tinggi dan CB yang agresif.
```

---

## 20. Hidden Gem Discovery (Fitur Baru)

### 20.1 Konsep

Hidden Gem Discovery adalah fitur yang menilai pemain menggunakan algoritma scoring multi-dimensi untuk menemukan pemain **undervalued** — berkinerja tinggi namun kurang dikenal atau berada di liga bawah radar.

### 20.2 Hidden Gem Score Algorithm

Score 0–100 dihitung dari:

```typescript
function calculateHiddenGemScore(player: PlayerWithStats): number {
  const weights = {
    performanceRatio: 0.30,   // Stats vs average pemain posisi sama di liga
    leagueLevelPenalty: 0.15, // Pemain di liga bawah dapat bonus
    ageBonus: 0.15,           // Under 23 mendapat bonus
    contractOpportunity: 0.20, // Expiring contract = higher score
    consistencyScore: 0.10,   // Variasi rating antar game
    marketValueGap: 0.10,     // Performance-to-value ratio
  };

  // Tiap dimensi 0-100, lalu weighted sum
  return Object.entries(weights).reduce((total, [key, weight]) => {
    return total + calculateDimension(key, player) * weight;
  }, 0);
}
```

**Dimensi detail:**

| Dimensi | Cara Hitung |
|---------|-------------|
| `performanceRatio` | Rating + Goals/90 + Assists/90 vs median posisi di liga |
| `leagueLevelPenalty` | Liga tier 3–4 mendapat bonus 15 poin (pemain hidden dari radar) |
| `ageBonus` | U21: +20, U23: +10, U25: +5, 26+: 0 |
| `contractOpportunity` | Expiring < 6 bulan: +25, < 12 bulan: +15, > 12 bulan: 0 |
| `consistencyScore` | Berdasarkan std deviation rating per game |
| `marketValueGap` | Performance percentile ÷ market value percentile |

### 20.3 Hidden Gem Page UI

```
💎 Hidden Gem Discovery

Filter: [Position] [Liga] [Age Range] [Min Score]

Top Hidden Gems This Week:

#1  Marcus Rodriguez   CM  Barnsley    Score: 94 🔥
    League 1 | Age 22 | Contract: Jun 2025
    "High performer in low-visibility league, expiring contract"
    [View Profile] [Generate Report] [Add to Shortlist]

#2  Yusuf Amara        RB  Northampton  Score: 89
    ...
```

**Badge system:**
- 🔥 Score 90+ = "Elite Hidden Gem"
- ⭐ Score 75–89 = "Strong Prospect"
- 💡 Score 60–74 = "Worth Watching"

### 20.4 Score Recalculation

- Dihitung ulang setiap 24 jam via Supabase Edge Function
- Score disimpan di kolom `players.hidden_gem_score`
- History score tidak disimpan di MVP (hanya current)

---

## 21. Contract Intelligence & Alerts (Fitur Baru)

### 21.1 Konsep

Contract Intelligence memonitor tanggal ekspirasi kontrak semua pemain di database dan mengirim alert kepada pengguna ketika ada peluang rekrutmen (pemain akan menjadi free agent).

### 21.2 Contract Status Classification

| Status | Kondisi | Badge |
|--------|---------|-------|
| 🔴 Critical | Kontrak habis < 3 bulan | "Expiring Soon" |
| 🟡 Warning | Kontrak habis 3–6 bulan | "Expiring in 6 months" |
| 🟠 Watch | Kontrak habis 6–12 bulan | "Under 1 Year" |
| 🟢 Stable | Kontrak habis > 12 bulan | "Active" |
| ⚫ Free Agent | Tidak ada klub / kontrak | "Free Agent" |

### 21.3 Contract Intelligence Dashboard

```
📅 Contract Intelligence

CRITICAL — Expiring < 3 Months (12 pemain)
┌─────────────────────────────────────────────────┐
│ James Ward    RB  Barnsley    Exp: 31 Jan 2025  │
│ Score: 82  |  Risk: Low  |  In Watchlist: ✅    │
│ [View] [Add to Shortlist] [Generate Report]     │
└─────────────────────────────────────────────────┘
...

WARNING — Expiring 3–6 Months (28 pemain)
...

IN WATCHLIST — Contract Alerts ON (5 pemain)
...
```

### 21.4 Alert System

**Trigger:** Edge Function cron job harian check contract status

**Alert types:**
- Pemain di Watchlist: kontrak baru masuk kategori Critical/Warning
- Pemain di Priority Shortlist: kontrak berubah status
- Pemain yang match filter posisi user: kontrak < 6 bulan

**Delivery:** Notifikasi in-app (bell icon) + email (via Resend, opt-in)

---

## 22. Player Watchlist & Monitoring (Fitur Baru)

### 22.1 Konsep

Watchlist adalah fitur monitoring jangka panjang. User menambahkan pemain ke Watchlist untuk mendapat update otomatis ketika ada perubahan signifikan.

### 22.2 Watchlist Events yang Dimonitor

| Event | Trigger |
|-------|---------|
| Contract status berubah | Kontrak masuk < 6 bulan |
| Performa naik signifikan | Rating naik > 0.5 poin dalam 5 game |
| Transfer terjadi | Player pindah klub (dari Sportmonks transfers) |
| Cedera (future) | Data injury tersedia di plan premium Sportmonks |
| Hidden Gem Score naik > 10 poin | Score recalculation harian |

### 22.3 Watchlist UI

```
👁️ Player Watchlist

Search watchlist...                        [+ Add Player]

Marcus Rodriguez  CM  Barnsley
  Score: 94 🔥  |  Contract: ⚠️ 6 bulan
  Last Update: Rating naik ke 7.6 (was 7.1)
  Added: 3 Jan 2025
  [View] [Report] [Move to Shortlist] [Remove]

Daniel Park  RW  Rotherham
  Score: 78  |  Contract: ✅ Jun 2026
  Last Update: Transferred to Sheffield Wed (24 Dec)
  Added: 15 Nov 2024
  [View] [Report] [Move to Shortlist] [Remove]
```

### 22.4 Watchlist Kapasitas per Plan

| Plan | Watchlist Limit |
|------|----------------|
| Free Trial | 10 pemain |
| Scout Pro | 50 pemain |
| Club | 200 pemain |
| Enterprise | Unlimited |

---

## 23. Data Ingestion & Sync Architecture

### 23.1 Architecture Overview

```
Sportmonks API v3
        ↓
Sportmonks Client (lib/providers/sportmonks/client.ts)
  - Bearer auth
  - Rate limit handler (exponential backoff)
  - Response caching check
        ↓
Normalization Layer (per entity)
  - Field mapping
  - Type coercion
  - Deduplication (by sportmonks_id)
        ↓
Supabase PostgreSQL (upsert by sportmonks_id)
        ↓
Post-Sync Processing:
  - Hidden Gem Score recalculation
  - Contract status update
  - Watchlist alert trigger
        ↓
data_sync_logs (write completion status)
        ↓
Frontend Dashboard (realtime via Supabase Realtime)
```

### 23.2 Sync Schedule

| Data Type | Sportmonks Endpoint | Frekuensi | Trigger |
|-----------|--------------------|-----------|---------| 
| Leagues | `/leagues` | Weekly (Senin 00:00) | Cron |
| Countries | `/countries` | Weekly | Cron |
| Positions | `/positions` | Weekly | Cron |
| Teams | `/teams` | Daily (02:00) | Cron |
| Players | `/players` (per league) | Daily (03:00) | Cron |
| Squads | `/squads/teams/{id}` | Daily (04:00) | Cron |
| Player Stats | `/statistics/seasons/players/{id}` | Daily (05:00) | Cron |
| Fixtures | `/fixtures/between/{start}/{end}` | Every 6 hours | Cron |
| Standings | `/standings/seasons/{id}` | Every 6 hours | Cron |
| Transfers | `/transfers/latest` | Daily (06:00) | Cron |
| Full Resync | All entities | Weekly (Minggu) | Manual/Cron |

### 23.3 Sync Worker Implementation

```typescript
// lib/providers/sportmonks/sync/players.ts
export async function syncPlayers(leagueId: string) {
  const client = createSportmonksClient();
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await client.get('/players', {
      params: {
        include: 'position;nationality;teams.team;statistics.details',
        'filter[league_id]': leagueId,
        per_page: 50,
        page,
      }
    });

    const normalized = response.data.map(normalizePlayer);
    await supabase.from('players').upsert(normalized, {
      onConflict: 'sportmonks_id'
    });

    hasMore = response.pagination?.has_more ?? false;
    page++;
    
    // Rate limit: 1 request per 200ms
    await sleep(200);
  }
}
```

### 23.4 Sync Status Dashboard (Admin)

```
📡 Data Sync Status

Last Full Sync: 7 Jan 2025, 06:15 WIB    [Trigger Full Sync]

ENTITY        | STATUS  | RECORDS | ERRORS | LAST RUN
Players       | ✅ OK   | 4,234   | 0      | 1 jam lalu
Teams         | ✅ OK   | 312     | 0      | 2 jam lalu
Fixtures      | ✅ OK   | 1,890   | 2      | 4 jam lalu
Standings     | ⚠️ Warn | 45      | 1      | 4 jam lalu
Transfers     | ✅ OK   | 234     | 0      | 5 jam lalu

SYNC LOGS (Recent)
─────────────────────────────────────────────────────
2025-01-07 06:15  Players  Success  4,234 records  0 errors
2025-01-07 06:10  Teams    Success  312 records    0 errors
2025-01-07 02:00  Fixtures Warning  1,890 records  2 errors
  Error: 404 on fixture_id 992341, 904882
```

### 23.5 Sportmonks Include Strategy per Use Case

```
Player List Page:
  ?include=position;nationality;teams.team

Player Detail Page:
  ?include=position;nationality;teams.team;statistics.details.type;transfers.fromTeam;transfers.toTeam

Squad Page:
  /squads/teams/{id}?include=player.position;player.nationality;player.statistics.details

Fixtures:
  ?include=participants;scores;state;league;round
```

---

## 24. Admin Panel

### 24.1 Admin Dashboard

Stats:
- Total users
- Total clubs
- Total players (synced)
- AI reports (total & bulan ini)
- Active subscriptions
- API call usage (Sportmonks + OpenAI)

### 24.2 Admin Pages

#### Users Management
- Tabel: nama, email, role, plan, joined, last_active
- Actions: Ubah role, Suspend, Impersonate, Delete
- Filter: role, plan, status

#### Clubs Management
- Tabel: nama klub, liga, admin, jumlah member, joined
- Actions: Lihat detail, Hapus

#### Players Management
- Tabel: nama, posisi, klub, sportmonks_id, last_synced
- Actions: Lihat profil, Force re-sync, Hapus (jika duplikat)
- Filter: liga, posisi, sync status

#### Data Sync Panel
- Status per entity (tabel)
- Trigger sync per entity atau full sync
- Sync logs dengan error detail
- API usage meter (Sportmonks request count)

#### AI Reports Monitoring
- Semua report yang pernah dibuat
- Filter: user, player, report type, tanggal
- Monitor AI usage & cost estimate

#### Subscriptions
- Tabel semua subscriptions
- Actions: Upgrade/downgrade manual, Reset limit, Suspend

---

## 25. Subscription Plans

### 25.1 Plan Matrix

| Feature | Free Trial | Scout Pro | Club | Enterprise |
|---------|-----------|-----------|------|------------|
| Durasi | 14 hari | — | — | — |
| Harga | Gratis | €29/bulan | €99/bulan | Custom |
| Player views | 200 | Unlimited | Unlimited | Unlimited |
| AI Reports/bulan | 5 | 50 | 300 | Unlimited |
| Shortlists | 1 | 5 | Unlimited | Unlimited |
| Watchlist size | 10 | 50 | 200 | Unlimited |
| Squad Analysis | ❌ | ✅ | ✅ | ✅ |
| Team Comparison | ❌ | ✅ | ✅ | ✅ |
| Contract Intelligence | ❌ | ✅ | ✅ | ✅ |
| Hidden Gem Discovery | ✅ (limited) | ✅ | ✅ | ✅ |
| Export PDF | ❌ | ✅ | ✅ | ✅ |
| Multi-user workspace | ❌ | ❌ | ✅ (5 users) | ✅ (unlimited) |
| Priority Support | ❌ | Email | Email + Chat | Dedicated AM |
| Custom AI Prompts | ❌ | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ❌ | ✅ |

### 25.2 Plan Enforcement

```typescript
// Cek sebelum generate AI report
async function checkAIReportLimit(profileId: string): Promise<boolean> {
  const { data } = await supabase
    .from('subscriptions')
    .select('ai_report_limit, ai_report_used, status')
    .eq('profile_id', profileId)
    .single();
  
  if (data?.status !== 'active') return false;
  if (data?.ai_report_used >= data?.ai_report_limit) return false;
  return true;
}
```

---

## 26. Database Schema

### 26.1 profiles

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text check (role in ('scout', 'analyst', 'club_admin', 'admin')) default 'scout',
  organization_name text,
  avatar_url text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_profiles_role on profiles(role);
```

### 26.2 clubs

```sql
create table clubs (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id integer unique,
  name text not null,
  short_name text,
  country text,
  country_id integer,
  league text,
  league_id integer,
  logo_url text,
  formation text,
  playing_style text,
  transfer_budget numeric,
  promotion_target boolean default false,
  founded integer,
  venue_name text,
  venue_capacity integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_clubs_sportmonks_id on clubs(sportmonks_id);
create index idx_clubs_league_id on clubs(league_id);
```

### 26.3 players

```sql
create table players (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id integer unique not null,
  name text not null,
  display_name text,
  firstname text,
  lastname text,
  date_of_birth date,
  nationality text,
  nationality_id integer,
  primary_position text,
  primary_position_id integer,
  secondary_position text,
  preferred_foot text check (preferred_foot in ('left', 'right', 'both')),
  current_club_id uuid references clubs(id),
  current_team_sportmonks_id integer,
  league text,
  league_id integer,
  height integer,
  weight integer,
  image_url text,
  market_estimate numeric,
  contract_until date,
  contract_status text check (contract_status in ('active', 'expiring', 'critical', 'free_agent')) default 'active',
  hidden_gem_score numeric,
  is_free_agent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_players_sportmonks_id on players(sportmonks_id);
create index idx_players_primary_position on players(primary_position);
create index idx_players_league_id on players(league_id);
create index idx_players_contract_until on players(contract_until);
create index idx_players_hidden_gem_score on players(hidden_gem_score desc);
create index idx_players_nationality_id on players(nationality_id);
```

### 26.4 player_stats

```sql
create table player_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  sportmonks_season_id integer,
  season text not null,
  team_id uuid references clubs(id),
  appearances integer default 0,
  minutes_played integer default 0,
  goals integer default 0,
  assists integer default 0,
  yellow_cards integer default 0,
  red_cards integer default 0,
  rating numeric(3,1),
  passing_accuracy numeric(5,2),
  shots_on_target integer default 0,
  tackles integer default 0,
  interceptions integer default 0,
  duels_won integer default 0,
  dribbles_success integer default 0,
  goals_per_90 numeric(4,2) generated always as (
    case when minutes_played > 0 then goals * 90.0 / minutes_played else 0 end
  ) stored,
  assists_per_90 numeric(4,2) generated always as (
    case when minutes_played > 0 then assists * 90.0 / minutes_played else 0 end
  ) stored,
  raw jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(player_id, sportmonks_season_id, team_id)
);

create index idx_player_stats_player_id on player_stats(player_id);
create index idx_player_stats_season on player_stats(season);
```

### 26.5 leagues

```sql
create table leagues (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id integer unique not null,
  name text not null,
  short_code text,
  country text,
  country_id integer,
  logo_url text,
  tier integer,
  active boolean default true,
  current_season_id integer,
  created_at timestamptz default now()
);
```

### 26.6 seasons

```sql
create table seasons (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id integer unique not null,
  league_id integer references leagues(sportmonks_id),
  name text not null,
  start_date date,
  end_date date,
  is_current boolean default false,
  created_at timestamptz default now()
);
```

### 26.7 squad_players

```sql
create table squad_players (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  sportmonks_season_id integer,
  season text,
  shirt_number integer,
  squad_role text check (squad_role in ('starter', 'backup', 'youth', 'loan')),
  on_loan boolean default false,
  loan_from_club_id uuid references clubs(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(club_id, player_id, sportmonks_season_id)
);

create index idx_squad_players_club_id on squad_players(club_id);
create index idx_squad_players_season on squad_players(sportmonks_season_id);
```

### 26.8 fixtures

```sql
create table fixtures (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id integer unique not null,
  league_id integer,
  season_id integer,
  round text,
  home_club_id uuid references clubs(id),
  away_club_id uuid references clubs(id),
  home_score integer,
  away_score integer,
  status text,
  state text,
  match_date timestamptz,
  venue text,
  raw jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_fixtures_league_id on fixtures(league_id);
create index idx_fixtures_match_date on fixtures(match_date desc);
create index idx_fixtures_home_club_id on fixtures(home_club_id);
create index idx_fixtures_away_club_id on fixtures(away_club_id);
```

### 26.9 standings

```sql
create table standings (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id),
  sportmonks_season_id integer,
  league_id integer,
  season text,
  position integer,
  played integer,
  wins integer,
  draws integer,
  losses integer,
  goals_for integer,
  goals_against integer,
  goal_difference integer generated always as (goals_for - goals_against) stored,
  points integer,
  form text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(club_id, sportmonks_season_id)
);
```

### 26.10 transfers

```sql
create table transfers (
  id uuid primary key default gen_random_uuid(),
  sportmonks_id integer unique,
  player_id uuid references players(id),
  from_club_id uuid references clubs(id),
  to_club_id uuid references clubs(id),
  transfer_date date,
  transfer_type text check (transfer_type in ('permanent', 'loan', 'free', 'return_from_loan')),
  fee_amount numeric,
  fee_currency text default 'EUR',
  season text,
  created_at timestamptz default now()
);

create index idx_transfers_player_id on transfers(player_id);
create index idx_transfers_transfer_date on transfers(transfer_date desc);
```

### 26.11 ai_scouting_reports

```sql
create table ai_scouting_reports (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  club_id uuid references clubs(id),
  created_by uuid references profiles(id),
  report_type text check (report_type in (
    'general', 'position_specific', 'tactical_fit',
    'replacement', 'hidden_gem', 'promotion_push'
  )) default 'general',
  executive_summary text,
  strengths jsonb,
  weaknesses jsonb,
  tactical_fit jsonb,
  risk_level text check (risk_level in ('Low', 'Medium', 'High')),
  risk_factors jsonb,
  recommendation_score numeric check (recommendation_score between 0 and 100),
  best_role text,
  similar_profiles jsonb,
  final_recommendation text check (final_recommendation in ('Sign', 'Monitor', 'Avoid')),
  reasoning text,
  ai_model text default 'gpt-4o',
  tokens_used integer,
  season text,
  created_at timestamptz default now()
);

create index idx_ai_reports_player_id on ai_scouting_reports(player_id);
create index idx_ai_reports_created_by on ai_scouting_reports(created_by);
create index idx_ai_reports_created_at on ai_scouting_reports(created_at desc);
```

### 26.12 shortlists

```sql
create table shortlists (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id),
  created_by uuid references profiles(id),
  name text not null,
  description text,
  transfer_window text,
  is_shared boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_shortlists_club_id on shortlists(club_id);
create index idx_shortlists_created_by on shortlists(created_by);
```

### 26.13 shortlist_players

```sql
create table shortlist_players (
  id uuid primary key default gen_random_uuid(),
  shortlist_id uuid references shortlists(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  status text check (status in (
    'watchlist', 'scout_further', 'priority_target', 'negotiation', 'rejected'
  )) default 'watchlist',
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  assigned_scout_id uuid references profiles(id),
  fit_score numeric check (fit_score between 0 and 100),
  risk_level text check (risk_level in ('Low', 'Medium', 'High')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(shortlist_id, player_id)
);

create index idx_shortlist_players_shortlist_id on shortlist_players(shortlist_id);
create index idx_shortlist_players_status on shortlist_players(status);
```

### 26.14 shortlist_notes

```sql
create table shortlist_notes (
  id uuid primary key default gen_random_uuid(),
  shortlist_player_id uuid references shortlist_players(id) on delete cascade,
  created_by uuid references profiles(id),
  content text not null,
  created_at timestamptz default now()
);
```

### 26.15 watchlist

```sql
create table watchlist (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  notes text,
  alerts_enabled boolean default true,
  added_at timestamptz default now(),
  unique(profile_id, player_id)
);

create index idx_watchlist_profile_id on watchlist(profile_id);
create index idx_watchlist_player_id on watchlist(player_id);
```

### 26.16 watchlist_events

```sql
create table watchlist_events (
  id uuid primary key default gen_random_uuid(),
  watchlist_id uuid references watchlist(id) on delete cascade,
  event_type text check (event_type in (
    'contract_expiring', 'performance_spike', 'transfer', 'gem_score_change'
  )),
  description text,
  old_value text,
  new_value text,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index idx_watchlist_events_watchlist_id on watchlist_events(watchlist_id);
create index idx_watchlist_events_is_read on watchlist_events(is_read);
```

### 26.17 data_sync_logs

```sql
create table data_sync_logs (
  id uuid primary key default gen_random_uuid(),
  provider text default 'sportmonks',
  sync_type text check (sync_type in (
    'leagues', 'teams', 'players', 'squads', 'player_stats',
    'fixtures', 'standings', 'transfers', 'full_resync'
  )),
  status text check (status in ('running', 'success', 'partial', 'failed')) default 'running',
  records_processed integer default 0,
  records_failed integer default 0,
  error_message text,
  error_details jsonb,
  triggered_by uuid references profiles(id),
  started_at timestamptz default now(),
  finished_at timestamptz,
  duration_seconds integer generated always as (
    case when finished_at is not null
    then extract(epoch from finished_at - started_at)::integer
    else null end
  ) stored
);

create index idx_sync_logs_sync_type on data_sync_logs(sync_type);
create index idx_sync_logs_started_at on data_sync_logs(started_at desc);
create index idx_sync_logs_status on data_sync_logs(status);
```

### 26.18 subscriptions

```sql
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) unique,
  club_id uuid references clubs(id),
  plan text check (plan in ('free', 'scout_pro', 'club', 'enterprise')) default 'free',
  status text check (status in ('active', 'trialing', 'past_due', 'canceled')) default 'trialing',
  trial_ends_at timestamptz default now() + interval '14 days',
  current_period_start timestamptz default now(),
  current_period_end timestamptz default now() + interval '1 month',
  ai_report_limit integer default 5,
  ai_report_used integer default 0,
  player_view_limit integer default 200,
  player_view_used integer default 0,
  watchlist_limit integer default 10,
  shortlist_limit integer default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 26.19 scout_notes (Player-level, tidak terikat shortlist)

```sql
create table scout_notes (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  created_by uuid references profiles(id),
  club_id uuid references clubs(id),
  content text not null,
  rating numeric(3,1) check (rating between 0 and 10),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_scout_notes_player_id on scout_notes(player_id);
create index idx_scout_notes_created_by on scout_notes(created_by);
```

### 26.20 club_members

```sql
create table club_members (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  role text check (role in ('scout', 'analyst', 'club_admin')) default 'scout',
  invited_by uuid references profiles(id),
  joined_at timestamptz default now(),
  unique(club_id, profile_id)
);

create index idx_club_members_club_id on club_members(club_id);
create index idx_club_members_profile_id on club_members(profile_id);
```

---

## 27. Supabase Storage

### 27.1 Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| `player-images` | Public | Foto pemain dari Sportmonks (di-cache) |
| `club-logos` | Public | Logo klub dari Sportmonks |
| `report-exports` | Private | PDF export AI scouting reports |
| `imported-csv` | Private | CSV squad import (post-MVP) |
| `avatars` | Private | Avatar profil user |

### 27.2 Image Caching Strategy

Sportmonks menyediakan `image_path` URL untuk pemain dan klub. Untuk menghindari dependency langsung ke CDN Sportmonks, opsi:
- **MVP:** Simpan URL langsung ke DB, serve dari Sportmonks CDN
- **Post-MVP:** Download & re-upload ke Supabase Storage saat sync

---

## 28. Reusable Components

### 28.1 Marketing Components

| Komponen | Deskripsi |
|----------|-----------|
| `Navbar` | Top nav marketing dengan logo, links, CTA |
| `HeroSection` | Animated hero dengan floating stat cards |
| `ProblemSection` | Pain point cards dengan icons |
| `FeaturesSection` | 6-card feature grid dengan glassmorphism |
| `HowItWorksSection` | Step-by-step dengan animasi |
| `DashboardShowcase` | Animated tabs dengan UI mockup |
| `PricingSection` | 4 plan cards dengan feature comparison |
| `TestimonialsSection` | Quote cards dengan avatar placeholder |
| `FAQSection` | Accordion dengan answers |
| `Footer` | 4-column footer dengan links |
| `AnimatedStatCard` | Floating card untuk hero section |

### 28.2 Dashboard Components

| Komponen | Deskripsi |
|----------|-----------|
| `Sidebar` | Collapsible sidebar dengan role-based menu |
| `DashboardHeader` | Header dengan search, notif, club selector |
| `MobileNav` | Bottom navigation untuk mobile |
| `StatCard` | Metric card dengan trend indicator |
| `AnalyticsChart` | Wrapper Recharts dengan theme |
| `RecentActivity` | Feed aktivitas terkini |
| `NotificationPanel` | Dropdown notifikasi |
| `RoleGuard` | HOC untuk proteksi komponen by role |
| `PlanLimitWarning` | Banner peringatan limit plan |

### 28.3 Player Components

| Komponen | Deskripsi |
|----------|-----------|
| `PlayerTable` | TanStack Table dengan sorting, pagination |
| `PlayerFilters` | Sidebar filter panel |
| `PlayerCard` | Card pemain untuk grid view |
| `PlayerHeader` | Header detail page dengan stats summary |
| `PlayerStatsGrid` | Grid stat cards per season |
| `PlayerRadarChart` | Radar chart 6-dimensi berbasis posisi |
| `PlayerPerformanceTrend` | Line chart rating per game |
| `PlayerCompareTool` | Side-by-side comparison 2 pemain |
| `TransferHistory` | Timeline transfer pemain |
| `HiddenGemBadge` | Badge score dengan color coding |
| `ContractStatusBadge` | Badge expiry status |
| `PositionBadge` | Colored badge per posisi |
| `NationalityFlag` | Flag emoji + nama negara |

### 28.4 Club & Squad Components

| Komponen | Deskripsi |
|----------|-----------|
| `ClubCard` | Card ringkasan klub |
| `ClubProfile` | Header profil klub |
| `SquadList` | Tabel squad dengan stats inline |
| `PositionalDepthChart` | Visual formasi dengan depth indicator |
| `AgeProfileChart` | Histogram umur skuad |
| `SquadWeaknessReport` | Render AI squad analysis |
| `FixtureList` | 5 fixture terakhir/berikutnya |
| `StandingWidget` | Posisi klasemen mini |

### 28.5 Report Components

| Komponen | Deskripsi |
|----------|-----------|
| `AIReportCard` | Card ringkasan report di list |
| `AIReportViewer` | Full report reader dengan sections |
| `ReportExportButton` | Tombol export dengan loading state |
| `RecommendationBadge` | Sign/Monitor/Avoid badge dengan color |
| `RiskBadge` | Low/Medium/High badge |
| `ScoreBadge` | Numeric score dengan color gradient |

### 28.6 Shortlist Components

| Komponen | Deskripsi |
|----------|-----------|
| `ShortlistBoard` | Kanban board dengan 5 kolom |
| `ShortlistPlayerCard` | Draggable player card di Kanban |
| `ShortlistForm` | Form buat/edit shortlist |
| `ShortlistExport` | Export shortlist ke CSV/PDF |
| `ShortlistNoteLog` | Timeline catatan per player |

### 28.7 UI Utilities

| Komponen | Deskripsi |
|----------|-----------|
| `DataTable` | Generic TanStack Table wrapper |
| `SearchBar` | Search input dengan debounce |
| `EmptyState` | Placeholder kosong dengan CTA |
| `LoadingState` | Spinner dengan pesan |
| `LoadingSkeleton` | Skeleton screens |
| `Pagination` | Navigasi halaman |
| `ConfirmDialog` | Dialog konfirmasi aksi |
| `UpgradePrompt` | Modal upgrade plan |

---

## 29. AI Prompt Templates

### 29.1 General Scouting Report

```
You are an elite professional football recruitment analyst with 20 years of experience
scouting in European football.

Analyze the following player for a lower-tier European football club and produce a
structured scouting report.

PLAYER PROFILE:
Name: {{player_name}}
Age: {{age}}
Position: {{position}}
Nationality: {{nationality}}
Current Club: {{current_club}}
League: {{current_league}} (Tier: {{league_tier}})
Height: {{height}}cm | Weight: {{weight}}kg | Preferred Foot: {{preferred_foot}}
Contract Until: {{contract_until}}
Hidden Gem Score: {{hidden_gem_score}}/100

SEASON STATISTICS ({{season}}):
Appearances: {{appearances}} | Minutes: {{minutes}}
Goals: {{goals}} | Assists: {{assists}}
Rating: {{rating}}/10
Yellow Cards: {{yellow_cards}} | Red Cards: {{red_cards}}
Pass Accuracy: {{passing_accuracy}}% | Tackles: {{tackles}}
Goals/90: {{goals_per_90}} | Assists/90: {{assists_per_90}}

CLUB CONTEXT:
Recruiting Club: {{recruiting_club}}
League: {{recruiting_league}}
Formation: {{formation}}
Tactical Style: {{tactical_style}}
Recruitment Need: {{recruitment_need}}
Transfer Budget: {{transfer_budget}}
Risk Tolerance: {{risk_tolerance}}

{{#scout_notes}}
SCOUT NOTES:
{{scout_notes}}
{{/scout_notes}}

Return ONLY a valid JSON object with this exact structure:
{
  "executive_summary": "string (2-3 sentences)",
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string"],
  "tactical_fit": {
    "assessment": "string",
    "formation_compatibility": ["string"],
    "role_suggestions": ["string"]
  },
  "risk_assessment": {
    "level": "Low|Medium|High",
    "factors": ["string"]
  },
  "recommendation_score": number,
  "best_role": "string",
  "similar_profiles": ["string (known player names)"],
  "final_recommendation": "Sign|Monitor|Avoid",
  "reasoning": "string (2-3 sentences)"
}
```

### 29.2 Squad Weakness Analysis

```
You are an AI Sporting Director Assistant specializing in squad depth analysis
for lower-tier European football clubs.

Analyze this squad for tactical weaknesses, positional gaps, and recruitment priorities.

SQUAD DATA:
Club: {{club_name}} | League: {{league}} | Season: {{season}}
Current Position: {{league_position}}/{{total_teams}}
Formation: {{formation}} | Style: {{tactical_style}}
Transfer Budget: {{transfer_budget}}

SQUAD MEMBERS:
{{#squad_players}}
- {{name}} | {{position}} | Age {{age}} | Rating: {{rating}} | Apps: {{appearances}} | Contract: {{contract_until}}
{{/squad_players}}

LEAGUE CONTEXT:
{{league_context}}

Return ONLY a valid JSON object:
{
  "squad_strengths": ["string"],
  "squad_weaknesses": ["string"],
  "positional_gaps": [
    {
      "position": "string",
      "severity": "Low|Medium|High|Critical",
      "depth": number,
      "reason": "string"
    }
  ],
  "aging_risk": {
    "risk_level": "Low|Medium|High",
    "at_risk_players": ["string"],
    "analysis": "string"
  },
  "tactical_mismatch": "string",
  "recruitment_priorities": [
    {
      "rank": number,
      "position": "string",
      "urgency": "Low|Medium|High|Immediate",
      "ideal_profile": "string",
      "reasoning": "string"
    }
  ],
  "promotion_readiness": "string",
  "overall_assessment": "string"
}
```

### 29.3 Recruitment Recommendation

```
You are a recruitment analyst for a lower-tier European football club.
Based on the club's needs and the available player database, rank and justify
the most suitable transfer targets.

CLUB NEEDS:
{{needs}}

AVAILABLE PLAYERS (pre-filtered):
{{#players}}
- ID: {{id}} | {{name}} | {{position}} | Age: {{age}} | League: {{league}}
  Stats: {{goals}}G {{assists}}A {{rating}} rating | Contract: {{contract_until}}
  Hidden Gem Score: {{hidden_gem_score}}
{{/players}}

Return ONLY a valid JSON array (max 10 items):
[
  {
    "player_id": "string",
    "player_name": "string",
    "fit_score": number,
    "reason": "string",
    "risk_level": "Low|Medium|High",
    "suggested_role": "string",
    "priority": "Immediate|High|Medium|Low",
    "contract_opportunity": "string"
  }
]
```

### 29.4 Hidden Gem Assessment

```
You are a talent identification specialist with expertise in discovering
undervalued players in lower-tier European football.

Assess whether this player qualifies as a "hidden gem" and explain why.

PLAYER: {{player_name}} | {{position}} | {{league}} | Age: {{age}}
STATS: {{stats_summary}}
HIDDEN GEM SCORE: {{hidden_gem_score}}/100

CONTEXT: Why they might be undervalued:
- League visibility: {{league_tier}}
- Contract situation: {{contract_status}}
- Age trajectory: {{age}} years old

Return ONLY valid JSON:
{
  "is_hidden_gem": boolean,
  "gem_category": "Elite|Strong|Emerging",
  "key_reasons": ["string"],
  "market_opportunity": "string",
  "ideal_next_club_profile": "string",
  "window_of_opportunity": "string"
}
```

### 29.5 Tactical Fit Score

```
You are a tactical analyst. Score how well this player fits the specified
club's tactical system.

PLAYER:
{{player_profile}}

CLUB TACTICS:
Formation: {{formation}}
Style: {{tactical_style}}
Pressing Intensity: {{pressing_intensity}}
Build-up Style: {{build_up_style}}
Defensive Line: {{defensive_line}}

Return ONLY valid JSON:
{
  "tactical_fit_score": number,
  "formation_fit": "Excellent|Good|Moderate|Poor",
  "style_compatibility": "string",
  "strengths_in_system": ["string"],
  "concerns": ["string"],
  "verdict": "string"
}
```

---

## 30. API Routes

### 30.1 Players

```
GET  /api/players
     ?position=CM&league=123&age_min=20&age_max=28&contract_expiry=expiring
     &hidden_gem_min=70&page=1&per_page=25&sort=hidden_gem_score:desc

GET  /api/players/:id                     → player detail lengkap
POST /api/players/import                  → trigger sync specific player dari Sportmonks
GET  /api/players/:id/stats               → stats per season
GET  /api/players/:id/transfers           → transfer history
GET  /api/players/:id/fixtures            → fixture stats (future)
GET  /api/players/:id/similar             → similar player recommendations (AI)
```

### 30.2 Clubs

```
GET  /api/clubs
     ?league=123&country=england&page=1&per_page=20

GET  /api/clubs/:id                       → club detail
GET  /api/clubs/:id/squad                 → squad aktif
GET  /api/clubs/:id/fixtures              → recent + upcoming fixtures
GET  /api/clubs/:id/standings             → posisi klasemen
POST /api/clubs/:id/analyze               → trigger AI squad analysis
GET  /api/clubs/:id/analysis              → get saved analysis
```

### 30.3 AI

```
POST /api/ai/scouting-report              → generate AI report untuk player
POST /api/ai/squad-analysis               → generate squad weakness analysis
POST /api/ai/recruitment-recommendation   → get recommended players
POST /api/ai/hidden-gem-assessment        → AI assessment untuk specific player
POST /api/ai/tactical-fit                 → calculate tactical fit score
```

### 30.4 Shortlists

```
GET  /api/shortlists                      → semua shortlist user/club
POST /api/shortlists                      → buat shortlist baru
GET  /api/shortlists/:id                  → detail shortlist + players
PUT  /api/shortlists/:id                  → update shortlist
DEL  /api/shortlists/:id                  → hapus shortlist

POST /api/shortlists/:id/players          → tambah player ke shortlist
PATCH /api/shortlists/:id/players/:pid   → update status/priority/notes
DEL  /api/shortlists/:id/players/:pid   → hapus player dari shortlist

POST /api/shortlists/:id/notes           → tambah note ke shortlist player
GET  /api/shortlists/:id/export          → export shortlist (CSV/PDF)
```

### 30.5 Watchlist

```
GET  /api/watchlist                       → semua pemain di watchlist user
POST /api/watchlist                       → tambah player ke watchlist
DEL  /api/watchlist/:playerId            → hapus dari watchlist
GET  /api/watchlist/events                → semua alerts/events
PATCH /api/watchlist/events/:id          → mark event as read
```

### 30.6 Reports

```
GET  /api/reports                         → semua AI reports user
GET  /api/reports/:id                     → report detail
DEL  /api/reports/:id                     → hapus report
GET  /api/reports/:id/export              → export report ke PDF
```

### 30.7 Sync (Admin Only)

```
POST /api/sync/leagues                    → sync leagues dari Sportmonks
POST /api/sync/teams                      → sync teams
POST /api/sync/players                    → sync players (per league)
POST /api/sync/player-stats              → sync player statistics
POST /api/sync/fixtures                   → sync fixtures
POST /api/sync/standings                  → sync standings
POST /api/sync/transfers                  → sync transfer data
POST /api/sync/full                       → trigger full resync
GET  /api/sync/logs                       → sync logs
GET  /api/sync/status                     → status sync terakhir per entity
```

### 30.8 Admin

```
GET  /api/admin/users                     → semua users
PATCH /api/admin/users/:id               → update role/status
GET  /api/admin/subscriptions             → semua subscriptions
PATCH /api/admin/subscriptions/:id       → update plan/limits manual
GET  /api/admin/stats                     → platform statistics
```

### 30.9 Contracts (Internal)

```
GET  /api/contracts/alerts                → semua pemain dengan kontrak expiring
GET  /api/contracts/watchlist-alerts     → alerts untuk pemain di watchlist user
```

---

## 31. Security Requirements

### 31.1 Authentication & Authorization

- Supabase Auth untuk semua user sessions
- JWT token verification di semua API routes
- Role-based access control (RBAC) via `profiles.role`
- Club-based access control via `club_members` table
- Admin routes dilindungi tambahan dengan role check di middleware

### 31.2 API Security

- **Sportmonks API key:** disimpan di server environment variables, tidak pernah dikirim ke client
- **OpenAI API key:** disimpan di server environment variables
- **Rate limiting AI endpoints:** max 3 req/menit per user, max 10 req/menit per org
- **Input validation:** semua input divalidasi dengan Zod sebelum diproses
- **SQL injection:** menggunakan Supabase client (parameterized queries)

### 31.3 Data Security

- Supabase RLS aktif di semua tabel
- Users hanya bisa akses data workspace mereka sendiri
- Club data hanya accessible oleh club members
- File storage menggunakan private buckets untuk report exports

### 31.4 Subscription Enforcement

```typescript
// Checked before:
// - AI report generation (ai_report_limit vs ai_report_used)
// - Adding to watchlist (watchlist_limit)
// - Creating shortlist (shortlist_limit)
// - Accessing squad analysis (plan check: free = blocked)
```

---

## 32. RLS Policy Requirements

```sql
-- PROFILES
-- User bisa read dan update profile sendiri
create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- CLUBS
-- Club members bisa read data klub mereka
create policy "Club members can read their club"
  on clubs for select using (
    id in (select club_id from club_members where profile_id = auth.uid())
  );

-- PLAYERS
-- Semua authenticated user bisa baca players
create policy "Authenticated users can read players"
  on players for select using (auth.role() = 'authenticated');

-- AI REPORTS
-- User bisa baca report yang dibuat diri sendiri atau satu klub
create policy "Users can read own reports"
  on ai_scouting_reports for select using (
    created_by = auth.uid() OR
    club_id in (select club_id from club_members where profile_id = auth.uid())
  );

create policy "Users can create reports"
  on ai_scouting_reports for insert with check (created_by = auth.uid());

-- SHORTLISTS
create policy "Users can manage own shortlists"
  on shortlists for all using (
    created_by = auth.uid() OR
    (is_shared = true AND club_id in (
      select club_id from club_members where profile_id = auth.uid()
    ))
  );

-- WATCHLIST
create policy "Users can manage own watchlist"
  on watchlist for all using (profile_id = auth.uid());

-- ADMIN: bypass semua RLS
create policy "Admins have full access"
  on profiles for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
-- (Diaplikasikan di semua tabel sensitif)
```

---

## 33. Analytics Tracking

### 33.1 Events (via PostHog)

| Event | Properties |
|-------|-----------|
| `user_signup` | role, plan |
| `onboarding_completed` | steps_completed |
| `player_viewed` | player_id, position, league |
| `player_filtered` | filters_used |
| `ai_report_generated` | player_id, report_type, score |
| `player_added_to_shortlist` | player_id, shortlist_id, status |
| `player_added_to_watchlist` | player_id |
| `squad_analysis_generated` | club_id, league |
| `hidden_gem_viewed` | player_id, gem_score |
| `contract_alert_clicked` | player_id, contract_status |
| `export_report_clicked` | report_id, format |
| `team_comparison_viewed` | club_ids |
| `data_sync_triggered` | sync_type, triggered_by |
| `upgrade_prompt_shown` | feature, current_plan |
| `upgrade_clicked` | from_plan, feature |

### 33.2 Dashboard Metrics (Platform Admin)

- AI report usage per user/org
- Most viewed players
- Most searched positions
- Most used filters
- Shortlist conversion rate (watchlist → priority)
- Contract alert click-through rate
- Feature adoption per plan tier

---

## 34. MVP Success Metrics

### 34.1 Product Metrics

| Metric | Target MVP |
|--------|-----------|
| Player profiles synced via Sportmonks | 1,000+ |
| Clubs available | 50+ |
| Leagues covered | 10+ |
| AI scouting reports generated | 50+ |
| Hidden Gem scores calculated | 1,000+ |
| Contract alerts triggered | 50+ |
| Waitlist signups via landing page | 50+ |
| Pilot users aktif | 5+ |
| Avg session duration | > 8 menit |

### 34.2 Business Metrics

| Metric | Target |
|--------|--------|
| Waitlist signups | 50+ |
| Demo calls booked | 10+ |
| Pilot users (free access) | 5+ |
| Potential paid pilot | 1+ |
| Feedback sessions dengan scout/analyst | 5+ |

### 34.3 Technical Metrics

| Metric | Target |
|--------|--------|
| Sportmonks sync success rate | > 98% |
| AI report generation time | < 15 detik |
| Player search response time | < 800ms |
| Dashboard first load (LCP) | < 2.5 detik |
| API error rate | < 1% |
| Uptime (Vercel + Supabase) | > 99.5% |

---

## 35. Seed Data

Buat seed data untuk demo & testing:

### 35.1 Leagues (10 liga)

Via Sportmonks sync — gunakan league IDs ini sebagai seed awal:
- EFL Championship (ID: 8)
- EFL League One (ID: 24)
- EFL League Two (ID: 25)
- National League England (ID: 462)
- Bundesliga 2 (ID: 82)
- Serie B Italy (ID: 137)
- Ligue 2 France (ID: 301)
- Segunda División Spain (ID: 564)
- Eerste Divisie Netherlands (ID: 72)
- Scottish Championship (ID: 501)

### 35.2 Teams & Players

- Sync 5 klub dari masing-masing liga pilihan = 50 klub
- Sync squad aktif tiap klub = estimasi 25 pemain × 50 = 1,250 pemain
- Sync player stats season saat ini

### 35.3 Dummy Users & Klub Internal

```sql
-- 3 users untuk demo
INSERT INTO profiles (id, full_name, email, role, organization_name)
VALUES
  ('uuid1', 'John Mitchell', 'scout@demo.scoutflow.ai', 'scout', 'Barnsley FC'),
  ('uuid2', 'Sarah Chen', 'analyst@demo.scoutflow.ai', 'analyst', 'Barnsley FC'),
  ('uuid3', 'David Harris', 'admin@demo.scoutflow.ai', 'club_admin', 'Barnsley FC');

-- 3 shortlists
INSERT INTO shortlists (name, description, created_by)
VALUES
  ('Summer 2025 Targets', 'Main transfer targets for summer window', 'uuid1'),
  ('January Backup', 'Emergency options for January window', 'uuid1'),
  ('Youth Prospects', 'U21 monitoring list', 'uuid2');

-- 10 AI reports (generated dummy data)
-- 5 watchlist entries per user
```

---

## 36. Development Phases

### Phase 1 — Foundation (Week 1–2)
- Setup Next.js 15 + TypeScript + Tailwind + shadcn
- Setup Supabase (schema, RLS, Auth)
- Supabase Auth (login, register, forgot password)
- Dashboard layout (sidebar, header, mobile nav)
- Basic routing structure
- Environment variables setup
- Vercel deployment initial

### Phase 2 — Data Provider (Week 2–3)
- Sportmonks API client
- Normalization layer (players, teams, fixtures, standings, transfers)
- Sync workers (per entity)
- Sync scheduler (Vercel Cron)
- Admin sync dashboard
- Seed data import (target 1,000+ players)

### Phase 3 — Core Features (Week 3–4)
- Player database (table, filters, search, pagination)
- Player detail page (header, stats, charts, transfer history)
- Club profile + squad list
- Positional depth chart
- Squad age analysis

### Phase 4 — AI Features (Week 4–5)
- AI scouting report (generate, save, view)
- Squad weakness analysis (AI output + visualizations)
- Recruitment recommendation engine
- Hidden Gem score calculation
- AI prompt templates finalization

### Phase 5 — Shortlist & Watchlist (Week 5–6)
- Transfer shortlist (Kanban board)
- Shortlist notes & timeline
- Player watchlist
- Contract Intelligence dashboard
- Contract alerts system

### Phase 6 — Marketing Website (Week 6–7)
- Landing page semua sections
- Pricing page
- Animated components (Framer Motion + Magic UI)
- Responsive mobile optimization

### Phase 7 — Polish & Launch Prep (Week 7–8)
- Loading & empty states untuk semua halaman
- Error handling & error pages
- Export PDF (placeholder UI)
- Team comparison page
- Subscription plan enforcement
- Onboarding wizard
- Seed data finalization
- Performance optimization
- Deployment guide
- Production checklist

---

## 37. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Sportmonks (single provider)
SPORTMONKS_API_TOKEN=

# App
NEXT_PUBLIC_APP_URL=https://app.scoutflow.ai
NEXT_PUBLIC_MARKETING_URL=https://scoutflow.ai

# Email (Resend)
RESEND_API_KEY=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Error Monitoring
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Cron Secret (Vercel Cron protection)
CRON_SECRET=
```

---

## 38. Production Checklist

### Infrastructure
- [ ] Supabase schema migrated (semua 20 tabel)
- [ ] RLS diaktifkan dan ditest di semua tabel
- [ ] Supabase Realtime diaktifkan untuk tabel yang perlu
- [ ] Supabase Storage buckets dibuat
- [ ] Vercel deployment berjalan sukses
- [ ] Vercel Cron jobs dikonfigurasi

### Data & Sync
- [ ] Sportmonks API token valid dan ditest
- [ ] Sync workers berjalan tanpa error
- [ ] Minimum 1,000 player profiles tersimpan
- [ ] Minimum 50 clubs tersimpan
- [ ] Player stats season aktif tersedia
- [ ] Hidden Gem scores terhitung untuk semua player
- [ ] Contract status terupdate

### Features
- [ ] Auth flow end-to-end (register, login, logout, reset)
- [ ] Onboarding wizard berfungsi
- [ ] Player search berfungsi (< 800ms response)
- [ ] Player filters berfungsi
- [ ] Player detail page menampilkan data lengkap
- [ ] AI scouting report generasi berjalan (< 15 detik)
- [ ] Squad weakness analysis berjalan
- [ ] Shortlist Kanban board berfungsi
- [ ] Watchlist + event alerts berfungsi
- [ ] Contract Intelligence dashboard berfungsi
- [ ] Hidden Gem Discovery page berfungsi
- [ ] Team comparison berfungsi
- [ ] Admin panel berfungsi

### Security
- [ ] Semua API keys tersimpan di environment variables
- [ ] Tidak ada API key yang terexpose di frontend
- [ ] RLS ditest dengan akun user berbeda
- [ ] Admin routes hanya accessible oleh admin
- [ ] Rate limiting AI endpoints aktif
- [ ] Zod validation aktif di semua API routes

### Performance & Quality
- [ ] Dashboard load < 2.5 detik (LCP)
- [ ] Player search < 800ms
- [ ] AI report < 15 detik
- [ ] Mobile responsive di semua halaman
- [ ] Loading states di semua async operations
- [ ] Empty states di semua list views
- [ ] Error pages (404, 500)
- [ ] Error monitoring (Sentry) aktif
- [ ] Analytics (PostHog) aktif
- [ ] Landing page responsive dan siap pitching

---

## 39. Final MVP Definition

MVP dianggap selesai jika:

1. ✅ User bisa **register, login, dan logout** dengan aman.
2. ✅ User bisa menyelesaikan **onboarding wizard** (club setup + priorities).
3. ✅ User bisa melihat **player database** dengan filter dan search.
4. ✅ User bisa membuka **player detail page** dengan stats lengkap dari Sportmonks.
5. ✅ User bisa melihat **Hidden Gem score** untuk setiap pemain.
6. ✅ User bisa **generate AI scouting report** dalam < 15 detik.
7. ✅ User bisa **membuat dan mengelola transfer shortlist** (Kanban).
8. ✅ User bisa **menambahkan pemain ke watchlist** dan mendapat alerts.
9. ✅ User bisa melihat **Contract Intelligence** (pemain expiring contracts).
10. ✅ User bisa melihat **squad analysis** dan weakness report untuk klub.
11. ✅ User bisa **membandingkan dua tim** side-by-side.
12. ✅ **Admin** bisa trigger Sportmonks data sync dari dashboard.
13. ✅ **Landing page** terlihat premium, responsif, dan siap dipakai untuk pitching.
14. ✅ **Subscription enforcement** berjalan (Free trial limited, gated features).

---

## 40. Codex Master Prompt

```md
You are a senior fullstack engineer, product designer, AI engineer, and SaaS architect.

Build a complete production-ready MVP SaaS called ScoutFlow AI.

ScoutFlow AI is an AI-powered football recruitment intelligence platform for lower-tier
European football clubs. It uses Sportmonks Football API v3 as the single data provider.

THE PRODUCT helps scouts, recruitment analysts, and sporting directors:
- discover undervalued players (Hidden Gem Discovery)
- analyze squad weaknesses (AI Squad Analysis)
- generate AI scouting reports (OpenAI GPT-4o)
- manage transfer shortlists (Kanban workflow)
- monitor player contracts (Contract Intelligence)
- track players over time (Watchlist)
- compare players and teams

---

TECH STACK:
- Next.js 15 App Router (TypeScript)
- Tailwind CSS v4
- shadcn/ui + Magic UI + Framer Motion
- Recharts + TanStack Table v8 + TanStack Query v5
- Zustand (client state)
- React Hook Form + Zod
- Supabase Auth + PostgreSQL + Storage + Edge Functions
- OpenAI GPT-4o with Structured Outputs
- Vercel AI SDK (streaming)
- Sportmonks Football API v3 (single data provider)
- Vercel deployment + Vercel Cron
- PostHog (analytics) + Sentry (errors)
- Resend (email)

---

DATA PROVIDER — SPORTMONKS API v3:
Base URL: https://api.sportmonks.com/api/v3/football
Auth: Bearer token in Authorization header
Key endpoints:
  /leagues, /seasons
  /teams, /teams/{id}, /squads/teams/{id}
  /players, /players/{id}, /players/search/{query}
  /statistics/seasons/players/{seasonId}
  /fixtures/between/{start}/{end}
  /standings/seasons/{seasonId}
  /transfers, /transfers/players/{id}

Use ?include= parameter for relations.
Normalize all Sportmonks data before storing in Supabase.
Store sportmonks_id as unique identifier in all tables.
Implement rate limiting, retry logic, and caching.

---

DESIGN:
Build a premium dark-mode sports-tech SaaS interface.
Design inspiration: Linear, Vercel, modern football analytics dashboards.
Use electric green (#00FF87) as accent color on deep navy (#0A0E1A) background.
Glassmorphism cards, smooth animations, premium typography.

---

ROUTES TO BUILD:
/(marketing): landing, pricing, features, about
/(auth): login, register, forgot-password, reset-password, onboarding
/dashboard: overview (role-based)
/players: database, [id] detail, compare
/clubs: list, [id] profile + squad + analysis
/shortlist: kanban board, [id]
/reports: list, [id] viewer
/watchlist: player monitoring
/hidden-gems: discovery engine
/contracts: contract intelligence
/compare/teams: team comparison
/admin: users, clubs, players, sync, reports, subscriptions

---

DATABASE (Supabase PostgreSQL — 20 tables):
profiles, clubs, players, player_stats, leagues, seasons,
squad_players, fixtures, standings, transfers,
ai_scouting_reports, shortlists, shortlist_players, shortlist_notes,
watchlist, watchlist_events, data_sync_logs, subscriptions,
scout_notes, club_members

Use generated columns where applicable (goal_difference, goals_per_90, etc.)
Use CHECK constraints for enum-like fields.
Create appropriate indexes for all filtered/sorted columns.

---

KEY FEATURES TO BUILD:

1. SPORTMONKS SYNC SYSTEM
   - Per-entity sync workers with pagination
   - Rate limiting (200ms between requests, exponential backoff on 429)
   - Normalization layer (Sportmonks → ScoutFlow schema)
   - Vercel Cron for scheduled syncs
   - Sync logs with error detail
   - Admin can trigger manual sync

2. PLAYER DATABASE
   - TanStack Table with server-side filtering + pagination
   - Filter panel: position, league, age, nationality, foot,
     contract status, hidden gem score, appearances, goals, assists
   - Columns: name+flag, age, position, club, league, apps, goals, assists, rating,
     hidden gem score, contract expiry, actions
   - Bulk actions: add to shortlist, add to watchlist, export CSV

3. HIDDEN GEM DISCOVERY
   - Algorithm: performance ratio (30%), league level bonus (15%),
     age bonus (15%), contract opportunity (20%), consistency (10%), market gap (10%)
   - Score 0-100, recalculated daily
   - Dedicated page with filter + ranked list
   - Badges: Elite (90+), Strong (75-89), Emerging (60-74)

4. AI SCOUTING REPORT
   - Input: player stats + club context + optional scout notes
   - Output: executive summary, strengths, weaknesses, tactical fit,
     risk level, recommendation score, best role, similar profiles,
     final recommendation (Sign/Monitor/Avoid)
   - Stream response via Vercel AI SDK
   - Save to DB, enforce subscription limits
   - Export to PDF placeholder

5. SQUAD INTELLIGENCE
   - Positional depth chart (visual formation)
   - Age profile histogram
   - AI weakness analysis with severity levels
   - Recruitment priorities (AI-ranked, with profile descriptions)

6. TRANSFER SHORTLIST (KANBAN)
   - 5 columns: Watchlist, Scout Further, Priority Target, Negotiation, Rejected
   - Drag-and-drop between columns
   - Per-player notes timeline
   - Assign to scout
   - Export to CSV/PDF

7. CONTRACT INTELLIGENCE
   - Monitor all players' contract expiry dates
   - Critical (<3 months), Warning (3-6 months), Watch (6-12 months)
   - Alert players in Watchlist
   - Dashboard with filtered views

8. WATCHLIST
   - Add/remove players
   - Event monitoring: contract change, performance spike, transfer
   - In-app notifications

9. TEAM COMPARISON
   - Select 2 clubs
   - Side-by-side stats table
   - Radar chart comparison
   - AI narrative comparison

10. SUBSCRIPTION ENFORCEMENT
    - Free: 5 AI reports, 200 player views, 1 shortlist, 10 watchlist
    - Scout Pro: 50 AI reports, unlimited views, 5 shortlists, 50 watchlist
    - Club: 300 AI reports, multi-user, unlimited shortlists, 200 watchlist
    - Enterprise: unlimited everything
    - Enforce limits in API middleware, show upgrade prompts

---

SECURITY:
- Supabase RLS on all tables
- API keys in server environment only
- Zod validation on all inputs
- Rate limiting on AI endpoints (3 req/min per user)
- Admin role guard middleware
- Club-based data isolation

---

UI COMPONENTS TO CREATE:
Marketing: Navbar, HeroSection, ProblemSection, FeaturesSection,
           HowItWorksSection, DashboardShowcase, PricingSection,
           TestimonialsSection, FAQSection, Footer

Dashboard: Sidebar, DashboardHeader, MobileNav, StatCard,
           AnalyticsChart, RecentActivity, NotificationPanel, RoleGuard

Players: PlayerTable, PlayerFilters, PlayerCard, PlayerHeader,
         PlayerStatsGrid, PlayerRadarChart, PlayerPerformanceTrend,
         PlayerCompareTool, TransferHistory, HiddenGemBadge,
         ContractStatusBadge, PositionBadge

Clubs: ClubCard, ClubProfile, SquadList, PositionalDepthChart,
       AgeProfileChart, SquadWeaknessReport

Reports: AIReportCard, AIReportViewer, ReportExportButton

Shortlist: ShortlistBoard, ShortlistPlayerCard, ShortlistForm

UI Utilities: DataTable, SearchBar, EmptyState, LoadingState,
              LoadingSkeleton, ScoreBadge, RiskBadge, UpgradePrompt

---

OUTPUT: Generate:
1. Complete folder structure
2. Full codebase (all pages, components, API routes, lib functions)
3. Supabase SQL schema (20 tables with indexes + RLS)
4. Sportmonks normalization & sync layer
5. AI prompt templates (5 types)
6. Hidden Gem score algorithm
7. Marketing landing page
8. Seed data SQL
9. Vercel deployment config (vercel.json + cron config)
10. Environment variables list
11. Production checklist
12. Deployment guide

DO NOT BUILD:
- YOLO tracking / AI video tracking
- Betting or fantasy systems
- Live score engine
- Real payment gateway (UI placeholder only)
- Public API
```

---

*ScoutFlow AI PRD v2.0 — Revised with Sportmonks API v3, Contract Intelligence, Hidden Gem Discovery, Player Watchlist, and detailed technical specifications.*
*Last Updated: 2025*
