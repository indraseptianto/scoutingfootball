# PRD — ScoutFlow AI 2.0

## Product Summary
ScoutFlow AI should evolve from a SportMonks-powered scouting MVP into a recruitment operating system for lower-tier and mid-market football clubs. The current product already proves three hard things: data ingestion from SportMonks v3, a usable Supabase-backed scouting dataset, and deterministic recruitment/scouting experiences across players, teams, hidden gems, contracts, and sync administration. The next phase should turn those components into a connected workflow used by sporting directors, heads of recruitment, analysts, and scouts during real transfer windows.

This PRD focuses on what is missing from the current MVP and defines the next product version.

## Current MVP Strengths
- SportMonks v3 is integrated as the single football data provider.
- Supabase schema and sync coverage are already broad enough to support player, club, squad, standings, fixtures, transfers, and statistics workflows.
- Core scouting surfaces already exist: home, hidden gems, scouting, recommendations, shortlist, watchlist, clubs, leagues, team comparison, contracts, and admin sync.
- The app already frames data into a football-specific product narrative rather than a raw admin dashboard.
- AI report generation is present in a cacheable form rather than being invoked blindly on every page load.

## MVP Gaps
The current product is strong as a data demo and exploratory prototype, but it is still missing several capabilities required for repeated weekly use by a recruitment team.

### 1. No persistent recruitment brief workflow
The recommendations page lets the user filter by position, age, contract, style, and risk, but those filters are request-time inputs only. There is no saved brief tied to a club, manager model, budget, transfer window, or priority role.

Impact:
- analysts cannot return to the same brief and continue work;
- no version history exists for a club's transfer strategy;
- the app behaves like a smart query tool, not a recruitment operating workflow.

### 2. Shortlist and watchlist are not yet a full pipeline
Discovery pages exist, but the state machine between discovery, scout review, coach validation, financial review, and final decision is still shallow.

Impact:
- no clear board view for candidate progression;
- no ownership, due date, or stage transitions;
- no clear separation between longlist, active shortlist, and negotiation-ready targets.

### 3. Scoring is not contextual enough
The deterministic scoring logic is promising, but it remains broadly generic. It does not yet deeply adapt by tactical role, league context, squad need, budget constraints, or replacement scenario.

Impact:
- rankings feel informative but not yet club-specific enough;
- fit scores risk over-weighting global production instead of role need;
- the system cannot yet answer "best target for our exact tactical problem" with enough confidence.

### 4. No explicit squad-gap intelligence workflow
The compare and club views show useful context, but the product does not yet formalize squad planning around role vacancies, age cliffs, contract cliffs, succession plans, and injury-risk replacement logic.

Impact:
- scouting starts from player search instead of squad need;
- the club cannot work backward from role gaps to market targets;
- the app lacks a transfer-window planning backbone.

### 5. No collaboration and decision memory
There is no strong multi-user workflow around notes, assignments, scout ownership, internal comments, approvals, or final decision logs.

Impact:
- the product cannot become the single source of truth for recruitment decisions;
- conversations still live outside the app in chat, docs, or spreadsheets;
- decisions are hard to audit after a window closes.

### 6. Limited executive outputs
The product can generate page-level analysis, but it does not yet produce purpose-built outputs for different stakeholders: sporting director, coach, finance lead, or board.

Impact:
- the same interface must serve every audience;
- final recommendations lack presentation-ready summaries;
- the system does not close the loop from analysis to decision meeting.

### 7. Missing alerting and market monitoring layer
The contracts and transfer data create a strong foundation, but the app does not yet behave like an active market monitor.

Impact:
- users must manually revisit pages to discover change;
- no alerts for contract windows, breakout players, playing-time drops, or transfer movement;
- hidden gems remain a static ranking rather than a live signal feed.

### 8. Limited confidence and data quality signaling
Admin sync gives operational health, but user-facing product areas still do not clearly communicate confidence, data freshness, coverage quality, or inference strength.

Impact:
- analysts may over-trust weak profiles;
- inferred contract statuses can be mistaken for exact data;
- the product lacks visible trust boundaries.

## Product Vision
ScoutFlow AI becomes the day-to-day recruitment command center for clubs that want to make faster, cheaper, and more evidence-based transfer decisions.

The product should help users answer five recurring questions:
1. Where is our squad weakest right now?
2. Which players fit the role, style, age curve, and budget we need?
3. Which targets are becoming available at the right market moment?
4. What evidence supports or weakens each decision?
5. What should we do next this week?

## Target Users
### Primary
- Sporting director
- Head of recruitment
- Recruitment analyst

### Secondary
- First-team coach / assistant coach
- Scout
- CEO / board observer for summary outputs

## Product Principles
- Start from squad needs, not from random player browsing.
- Prefer actionable decision support over broad football data exploration.
- Show confidence, freshness, and uncertainty clearly.
- Let deterministic logic do the heavy lifting; use AI to explain, summarize, and package.
- Keep every important decision persistent and auditable.

## Core Jobs to Be Done
- Define a transfer brief for a position and role.
- Surface the best candidate pool for that brief.
- Compare candidate quality, risk, and affordability.
- Track targets over time as new sync data arrives.
- Convert analysis into decisions, meeting notes, and executive summaries.

## Phase 2 Product Goals
### Goal 1: Turn discovery into a workflow
Introduce persistent recruitment briefs, candidate stages, ownership, and weekly operating views.

### Goal 2: Make ranking truly club-aware
Refactor the recommendation engine into role-specific, context-aware scoring models.

### Goal 3: Build squad planning as the product backbone
Add role-vacancy, succession, contract-cliff, and squad-balance analysis.

### Goal 4: Add market monitoring and alerts
Transform transfers/contracts/statistics into proactive signals.

### Goal 5: Make outputs usable for decisions
Add coach-ready, sporting-director-ready, and board-ready summaries.

## Proposed Feature Areas

### A. Recruitment Briefs
Users can create and save briefs with:
- club/team;
- transfer window;
- target position and role archetype;
- age range;
- tactical style;
- risk tolerance;
- contract preference;
- budget band;
- league focus;
- required and nice-to-have traits.

Each brief should store:
- owner;
- status;
- created date;
- last updated date;
- revision history.

Success metric:
- at least 70% of recommendation sessions start from a saved brief instead of one-off filters.

### B. Squad Planner
A dedicated squad planning module should identify:
- thin positions;
- aging positions;
- expiring-contract clusters;
- low-minute or low-output roles;
- succession risks;
- role imbalance by tactical shape.

Output:
- priority role list for each club;
- urgency score by role;
- recommended acquisition profile.

Success metric:
- user can identify top 3 squad needs within 3 minutes.

### C. Smart Recommendation Engine 2.0
Upgrade ranking from broad deterministic score to role-aware scoring.

Examples:
- ball-winning midfielder model;
- progression fullback model;
- pressing winger model;
- penalty-box striker model;
- buildup center-back model.

Inputs should include:
- role archetype;
- tactical style;
- squad need;
- age curve;
- contract opportunity;
- minutes confidence;
- league strength proxy.

Output should include:
- fit score;
- readiness score;
- market opportunity score;
- confidence score;
- rationale bullets.

Success metric:
- recommendation CTR into profile/review pages improves meaningfully relative to current generic rankings.

### D. Longlist → Shortlist Pipeline
Unify candidate progression into a consistent operating board.

Stages:
- discovered;
- watched;
- shortlisted;
- under review;
- coach approved;
- finance check;
- decision made.

Each card should support:
- notes;
- owner;
- tags;
- risk label;
- date added;
- evidence completeness;
- next action.

Success metric:
- every active target appears in a single persistent board rather than scattered pages.

### E. Candidate Dossier
Player pages should evolve into dossier-style views with:
- scouting summary;
- role fit;
- trend view;
- contract / transfer context;
- statistical evidence;
- scout notes;
- AI executive summary;
- decision history.

The dossier should answer:
- why now;
- why us;
- why this role;
- what is the biggest risk.

### F. Market Alerts
Introduce alerts for:
- contract windows;
- players whose minutes collapse;
- breakout form spikes;
- transfer rumors / status changes where available;
- role targets moving into affordability range;
- watchlist players changing clubs or leagues.

Success metric:
- users return due to product-triggered monitoring, not only scheduled exploration.

### G. Executive Outputs
Generate stakeholder-specific outputs:
- sporting director memo;
- coach fit summary;
- transfer committee shortlist deck;
- board-level market overview.

These should be concise, cached, and exportable.

## Functional Requirements
### Must Have
- saved recruitment briefs;
- squad-need prioritization;
- role-aware recommendation scoring;
- unified candidate board;
- candidate dossiers with persistent notes;
- user-facing confidence/freshness indicators;
- market alerts and watch triggers;
- executive summaries by audience.

### Should Have
- coach feedback workflow;
- assignment and reviewer ownership;
- shortlist comparison table with weighted traits;
- export to PDF/shareable summary.

### Could Have
- scenario simulation for outgoing transfers;
- budget allocation planning;
- agent / deal-status workflow.

## Non-Functional Requirements
- all SportMonks access remains server-side only;
- every recommendation surface must expose freshness and confidence;
- user-facing pages should stay fast with cached Supabase-first reads;
- AI must never replace raw evidence, only summarize it;
- design should work on laptop-first workflows used by analysts in meetings.

## Success Metrics
### Product
- more repeated use of saved briefs and shortlist boards;
- faster time from squad need to ranked candidates;
- increased number of persistent notes / decisions captured inside the app.

### UX
- user can move from squad issue to shortlist in one clear path;
- user can explain why a player is recommended without opening multiple pages.

### Data trust
- user can quickly tell whether a contract signal is exact or inferred;
- user can identify stale data before acting on it.

## Recommended Build Order
### Phase 2A
- recruitment briefs;
- squad planner;
- candidate board state model;
- user-facing confidence/freshness indicators.

### Phase 2B
- role-aware recommendation models;
- candidate dossiers;
- improved AI summaries.

### Phase 2C
- alerts and monitoring;
- stakeholder export views;
- decision/audit history.

## Repo-Specific Observations
This PRD is based on the current `scoutingfootball` codebase, which already includes:
- strong SportMonks ingestion and normalization;
- extensive page scaffolding;
- deterministic recommendation logic;
- AI cached scouting reports;
- sync operations visibility.

The core gap is not data availability. The core gap is transforming those assets into a persistent recruitment workflow that feels indispensable during a live transfer window.
