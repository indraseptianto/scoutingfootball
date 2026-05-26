# Sportmonks Response Audit

These sanitized samples were captured from production Supabase raw columns after Sportmonks sync. They are intentionally small and token-free.

## Metric Mapping

`src/lib/providers/sportmonks/metrics.ts` is the canonical mapping layer for `details.type`.

| Internal metric | Sportmonks detail aliases observed/supported |
| --- | --- |
| `minutes` | `MINUTES_PLAYED`, `minutes`, `minutes_played` |
| `goals` | `GOALS` |
| `assists` | `ASSISTS` |
| `expected_goals` | `EXPECTED_GOALS`, `xg` |
| `expected_assists` | `EXPECTED_ASSISTS`, `xa`, `xd` |
| `pass_accuracy` | `ACCURATE_PASSES_PERCENTAGE`, `PASS_ACCURACY` |
| `dribble_success_rate` | explicit `DRIBBLE_SUCCESS_RATE`, or calculated from successful dribbles / attempts |
| `duels_won` | `DUELS_WON` |
| `duels_won_percentage` | explicit percentage, or calculated from duels won / total duels |

The same helper is now used by match-level fixture stats and season-level player stats, so downstream UI and AI receive the same normalized columns.
