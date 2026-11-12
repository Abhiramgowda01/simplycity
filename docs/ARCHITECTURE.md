# Architecture
- `src/engine.ts` pure scheduling logic (no UI/storage): busyFor -> freeSlots -> priority -> generate -> validate -> reschedule; dedupe/detectConflicts.
- `src/importers.ts` CSV/ICS parsing with strict validation. `src/demo.ts` demo data. `src/App.tsx` UI + localStorage persistence (`smartstudy:user`, `smartstudy:demo`).
Algorithm: per planning day (study days only) compute free slots (window minus fixed events, unavailable periods, existing sessions); fill slots with sessions of <= session length, picking the demand with the best score = course priority + need-vs-days-left pressure - same-day repetition penalty. Course prep demands end the day before the nearest exam; task demands end on their deadline. Unmet demand is reported as unscheduled. `validate` re-checks every rule independently. `reschedule` locks done/missed/past sessions, regenerates from today and returns a diff for preview.
Tests: `tests/engine.test.ts`.
