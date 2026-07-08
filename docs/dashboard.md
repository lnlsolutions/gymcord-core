# Member Dashboard V1

Build 023 introduces the production-ready member dashboard home at `/` and the developer verification page at `/dev/dashboard`.

## Repository contract

Dashboard UI components never import Supabase directly. `MemberDashboard` loads a complete `DashboardData` model through `DashboardRepository`, which composes persisted daily activity data from `DailyActivityRepository` with the existing workout, mission, XP, streak, achievement, Atlas, and transformation engines.

The same repository works in Mock and Supabase modes because provider selection remains encapsulated in the existing backend provider and daily activity repository layer.

## Cards

The dashboard renders:

- Dashboard header
- Daily summary card
- Today's workout
- Mission progress
- XP progress
- Streak widget
- Nutrition summary
- Water tracker
- Weight tracker and progress photo reminder
- Atlas greeting
- Upcoming tasks

## Developer page

Open `/dev/dashboard` to verify:

- repository status
- active provider
- loaded dashboard data
- refresh status
- offline queue
- cache state

## Validation

Run:

```bash
npm run build
npm run test
```
