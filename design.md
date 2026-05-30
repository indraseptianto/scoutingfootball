# Design Spec — ScoutFlow AI 2.0

## Design Goal
The current product already looks more like a football product than a generic dashboard, but the experience still behaves like a collection of useful pages. The next design phase should turn ScoutFlow AI into a focused recruitment workspace where every screen answers one practical question in the transfer workflow.

The design goal is to make the product feel like a live recruitment room:
- clear priorities;
- persistent context;
- fast switching between squad need, target discovery, evidence review, and decision state;
- visible trust signals around data freshness and confidence.

## Current UX Strengths
- Strong football-specific framing and terminology.
- Good page coverage across discovery, scouting, comparison, hidden gems, contracts, and sync health.
- Visual language already avoids bland admin-tool aesthetics.
- Home page positioning is clear and commercially legible.
- Some high-value workflows already exist in usable first-pass form.

## Current UX Problems
### 1. The app is page-rich but workflow-light
The user can visit many surfaces, but the path between them is not yet cohesive. Discovery, recommendation, shortlist, watchlist, and scouting still feel like separate destinations rather than one connected operating flow.

### 2. Too much context resets between pages
Filters, tactical assumptions, club priorities, and candidate intent do not persist strongly enough. A user must repeatedly reconstruct their working context.

### 3. The app starts from players more often than from squad problems
That is useful for exploration, but real recruitment teams usually begin from role vacancies, succession concerns, or market timing.

### 4. Trust signals are not prominent enough
Exact vs inferred contract data, sample-size strength, sync freshness, and evidence completeness need stronger visual treatment in product surfaces, not only in admin views.

### 5. Candidate progression is not operationally visible
There is not yet a central board showing which targets are under review, who owns them, what evidence is missing, and what decision comes next.

## Experience Principles
- Start with club needs, not with raw player search.
- Keep the user's working context visible at all times.
- Make evidence traceable before making AI persuasive.
- Reward progression and decisions, not just browsing.
- Use bold football-room visuals, but keep data reading fast and disciplined.

## Proposed Information Architecture
The product should be reorganized around the transfer workflow.

### Primary Navigation
- Overview
- Squad Planner
- Recruitment Briefs
- Targets
- Market Alerts
- Reports
- Admin

### Supporting Entities
- Players
- Clubs
- Leagues
- Sync Logs

This structure shifts the center of gravity:
- from pages about data categories;
- to workflows about decisions and actions.

## Core Screens

### 1. Overview / Recruitment Command Center
Purpose: give the sporting director or analyst one place to start every day.

Sections:
- current squad priorities;
- active briefs;
- hot market alerts;
- shortlist movement;
- stale data warnings;
- pending decisions.

Key widgets:
- top 3 urgent squad gaps;
- targets needing scout review;
- expiring-contract opportunities;
- watchlist risers;
- data confidence warnings.

This page should feel like a daily operating desk, not a marketing homepage.

### 2. Squad Planner
Purpose: identify what the club needs before looking at names.

Layout:
- left: formation / role map or role list by unit;
- center: urgency cards by position/role;
- right: reasons panel with contract cliffs, age curve, minutes concentration, and output concerns.

Interactions:
- click a role to open or create a recruitment brief;
- compare current in-squad options;
- mark role as immediate / next window / monitor.

Visual behavior:
- strong use of positional cards, role tags, and urgency color hierarchy;
- should feel tactical and football-native, not spreadsheet-like.

### 3. Recruitment Brief Detail
Purpose: persist the actual recruitment problem the club is trying to solve.

Sections:
- brief summary;
- tactical role definition;
- constraints and preferences;
- candidate pipeline;
- evidence checklist;
- recent alerts affecting this brief.

UX requirements:
- sticky brief header with role, budget band, style, owner, and status;
- revision history;
- ability to regenerate ranked candidates using the same brief.

### 4. Targets Board
Purpose: unify longlist, watchlist, shortlist, and review states.

Preferred view:
- kanban board by stage with compact target cards.

Card contents:
- player name;
- position;
- fit score;
- market opportunity score;
- confidence badge;
- owner;
- next action;
- evidence completeness.

Alternative view:
- dense analyst table for sorting, filtering, and batch review.

The user should be able to switch between:
- board mode;
- table mode;
- comparison mode.

### 5. Candidate Dossier
Purpose: make a player page feel like a transfer case file.

Structure:
- hero with player identity, role, club, age, contract state, and recommendation snapshot;
- evidence strip with freshness, confidence, sample size, and source quality;
- tabs or anchored sections for role fit, statistical profile, trend view, transfer context, notes, and AI summary;
- decision history panel on the side.

Important design behavior:
- every AI statement should sit near the evidence it summarizes;
- contract and transfer uncertainty should be visually obvious;
- comparison-ready metrics should be easy to scan.

### 6. Market Alerts
Purpose: turn passive data into a feed of scouting opportunities.

Feed groups:
- contract opportunities;
- breakout form;
- watchlist movement;
- role-fit matches for active briefs;
- risk alerts on current targets.

Interactions:
- pin alert to brief;
- convert alert to target;
- dismiss or snooze;
- assign to scout.

This page should feel more like an intelligence feed than a static leaderboard.

### 7. Reports
Purpose: package insight for decision-makers.

Report types:
- sporting director memo;
- coach tactical fit report;
- shortlist comparison deck;
- transfer committee summary.

UX requirement:
- pick audience first, then the product changes tone and structure of output.

## Design System Direction
The existing visual language already has energy. The next version should sharpen it into something that feels like premium football operations software.

### Visual Character
- dark, pitch-room atmosphere remains valid;
- neon-accent signals should be used selectively for urgency, quality, and active system state;
- surfaces should feel layered like tactical boards and analysis tables, not generic cards everywhere.

### Typography
- keep strong display typography for headline moments;
- use a more neutral, readable text rhythm for dense analyst views;
- make numeric and tabular data highly legible.

### Color Semantics
Use consistent meaning, not decorative color.
- green: strong fit / healthy / exact / positive opportunity;
- amber: caution / inferred / moderate risk / incomplete evidence;
- red: urgent risk / stale / blocked / weak confidence;
- blue: informational / comparison / coach-review context.

### Density Modes
Support two reading modes:
- executive mode: high-summary, low-density cards and narrative;
- analyst mode: compact tables, filters, and evidence-heavy layouts.

## Key UI Patterns
### Persistent Context Bar
A sticky context bar should appear on workflow screens showing:
- selected club;
- active brief;
- transfer window;
- tactical style;
- current data freshness.

This avoids constant context loss.

### Confidence Badges
Every player recommendation and contract insight should show:
- exact;
- inferred;
- low sample;
- stale sync;
- review needed.

These badges should be unavoidable but not noisy.

### Evidence Completeness Meter
For each target, show whether the club has enough information to make a decision.

Possible checklist:
- sufficient minutes sample;
- contract data;
- transfer history;
- recent performance;
- internal scout notes;
- coach feedback.

### Action-Oriented Empty States
Empty states should not just say there is no data. They should direct the user toward the next action:
- create brief;
- run sync;
- widen filters;
- assign scout;
- move target to shortlist.

## Mobile and Responsive Behavior
This product is desktop-first, but mobile should still work for review and meeting reference.

Mobile priorities:
- command center cards;
- candidate dossier summary;
- target board as stacked cards;
- reports and notes.

Desktop priorities:
- comparison tables;
- board workflows;
- squad planning;
- analyst review density.

## Suggested MVP-to-2.0 UX Rollout
### Phase 1
- add persistent context bar;
- add saved recruitment briefs;
- redesign shortlist/watchlist into a unified targets board;
- expose confidence and freshness badges everywhere.

### Phase 2
- add squad planner;
- redesign player pages into dossiers;
- add executive/analyst density modes.

### Phase 3
- add alerts feed and stakeholder report generator;
- add richer collaboration and decision history.

## Success Criteria
The redesign is successful if:
- users start from squad need or saved brief instead of ad hoc browsing;
- users can move from discovery to shortlist without losing context;
- users can explain why a player is recommended and how trustworthy the evidence is;
- the app becomes the working memory of the recruitment process, not just the place where stats are viewed.

## Repo-Specific Design Recommendation
Do not throw away the current visual direction. The existing product already has a strong football-tech tone. The best path is to keep that tone and refocus the experience around persistent workflow, evidence clarity, and decision progression.
