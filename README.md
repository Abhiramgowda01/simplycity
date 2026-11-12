# SmartStudy – Intelligent Academic Scheduling (prototype)

Merges timetable, event calendar, CIE and SIE schedules, then generates a clash-free, priority-weighted study plan with dynamic rescheduling. React + TypeScript + Vite; data persists in localStorage. No external AI/API is used - scheduling is deterministic.

## Run
```
npm install
npm run dev      # open the printed URL, click "Load demo data"
npm test         # 20 engine tests
npm run build
```

## What is implemented
- Import of CSV and ICS files (multiple at once, any subset of the 5 document categories), manual entry, edit/delete, "blocks study" and "verified" toggles, duplicate detection, conflict flagging (never silently overwritten).
- Recurring weekly expansion, one-off events, holidays (all-day), CIE/SIE exams as fixed blocks.
- Preferences: planning range, daily window, daily target, session/break length, study days, unavailable periods.
- Courses (difficulty/understanding/importance/hours), tasks (overdue / <24h / <=3d / <=7d flags), exam tasks from imported exam events.
- Engine (`src/engine.ts`): free-slot calculation, priority score (30/25/20/15/10 weights, normalised 0-100), greedy allocation with fairness penalty, exam prep strictly before exam date plus "revision" sessions in the last 2 days, shortage report, validator, rescheduler with preview (done/missed/past sessions preserved).
- Dashboard, weekly calendar, session Done/Missed, progress (only Done counts), dark mode, demo mode stored separately.

## CSV format
`title,day_or_date,start,end[,type]` e.g. `DSA Lecture,Mon,09:00,10:00` or `DSA CIE,2026-11-23,09:00,12:00,cie`. Incomplete rows are rejected, never guessed.

## Limitations (honest list)
- PDF/image OCR (Tesseract.js / PDF.js) is **not implemented**; those files are rejected with a message. Convert to CSV/ICS or enter manually.
- Calendar is a week view (no separate day/month views); sessions are marked/reset but not drag-rescheduled.
- Overnight events are clipped at midnight. No backend/Supabase. Mock tests are not scheduled separately (last-2-day revision only).
- shadcn/ui, Recharts, date-fns, Tailwind are not used (plain CSS, own date math) to keep the prototype small.
