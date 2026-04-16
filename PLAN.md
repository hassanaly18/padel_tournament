# Implementation Plan: Supabase Integration & Round-Robin Logic

## Goal
Migrate the Padel House tournament application to use the configured Supabase database, completely removing in-memory mock data. Implement round-robin scheduling for the 4 groups (roughly 5 teams each).

## Proposed Changes

### 1. Database Utilities (`lib/supabase-api.ts`)
#### [NEW] `lib/supabase-api.ts`
Create a centralized file to hold async CRUD functions calling Supabase:
- `getTeams()`, `getGroups()`, `getMatches()`
- `addTeam(team)`, `updateTeam(id, changes)`, `deleteTeam(id)`
- `addMatch(match)`, `updateMatch(id, changes)`
- `scheduleRoundRobinMatches()` - this will contain the logic where each team of a group plays once against the other teams in the same group.

### 2. Frontend Migration
#### [MODIFY] `app/page.tsx`
Change from pulling synchronous mock data to fetching from Supabase using `useEffect` (or passing from a Server Component to a Client Component filter wrapper).

#### [MODIFY] `app/admin/page.tsx`
Fetch dashboard stats from Supabase.
Add an admin button/action: **"Generate Schedule"**, which will trigger round-robin logic for all groups.

#### [MODIFY] `lib/store.ts`
Remove the synchronous state that serves the mock data. Modify or remove entirely to point entirely to Supabase database.

#### [DELETE] `lib/data.ts`
Remove the mock data definitions entirely.

### 3. Round-Robin Scheduling Logic
When creating the initial data, we will:
1. Define 4 Groups (A, B, C, D)
2. Add teams. Let's assume there are about 5 teams per group.
3. For each group, we compute all possible pairings `(Team A, Team B)` ensuring each team plays once against every other.
   - For 5 teams: A-B, A-C, A-D, A-E, B-C, B-D, B-E, C-D, C-E, D-E (10 matches per group).

### 4. Seed Data Script (`scripts/seed.ts`) - Optional
#### [NEW] `scripts/seed.mjs`
Since the tables are currently empty, I will write a Node script that uses Supabase REST API to seed:
- The 4 Groups
- 20 Teams (5 per group, or as specified by you)
And then triggers the round-robin scheduling to put the matches in the database.

## Verification Plan
1. Auto verification: Run the seed script and verify in console that tables get correctly populated without duplicate entries.
2. Manual verification: Browse the NextJS application UI (`localhost:3000`) and verify real data appears in "Matches" and "Admin" pages.
3. Test match updates by going to the Admin view (if it has update UI) or using the API directly to change a match score and see it reflect on the UI.
